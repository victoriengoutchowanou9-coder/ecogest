/**
 * Helper client pour les notifications Web Push PWA (W3C Push API)
 * Plateforme ECOGEST
 */

export function isPushNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (err) {
    console.warn("[PushClient] Erreur obtention abonnement push:", err);
    return null;
  }
}

export async function registerPushSubscription(vapidPublicKey?: string): Promise<{
  success: boolean;
  subscription?: PushSubscription;
  error?: string;
}> {
  if (!isPushNotificationSupported()) {
    return { success: false, error: "Les notifications push ne sont pas supportées par votre navigateur." };
  }

  try {
    // 1. Demande d'autorisation explicite
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "L'autorisation des notifications a été refusée sur cet appareil." };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    // 2. Si non abonné et clé VAPID présente, s'abonner
    if (!subscription && vapidPublicKey) {
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    if (!subscription) {
      return {
        success: false,
        error: "Configuration VAPID requise pour enregistrer l'abonnement push.",
      };
    }

    // 3. Envoyer les clés au serveur via l'API
    const p256dh = subscription.getKey("p256dh");
    const auth = subscription.getKey("auth");

    const p256dhBase64 = p256dh ? btoa(String.fromCharCode(...new Uint8Array(p256dh))) : "";
    const authBase64 = auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : "";

    await fetch("/api/notifications/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dhBase64,
          auth: authBase64,
        },
        userAgent: navigator.userAgent,
      }),
    });

    return { success: true, subscription };
  } catch (err: any) {
    console.error("[PushClient] Erreur souscription push:", err);
    return { success: false, error: err.message || "Erreur lors de l'activation des notifications." };
  }
}

export async function unregisterPushSubscription(): Promise<boolean> {
  if (!isPushNotificationSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await fetch("/api/notifications/push", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      return await subscription.unsubscribe();
    }
    return true;
  } catch (err) {
    console.error("[PushClient] Erreur désinscription push:", err);
    return false;
  }
}
