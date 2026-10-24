"use client";

import React from "react";
import { BulletinViewerPage } from "@/components/school/BulletinViewerPage";

export default function SecretariatBulletinsPage() {
  return <BulletinViewerPage role="secretariat" basePath="/secretariat" />;
}
