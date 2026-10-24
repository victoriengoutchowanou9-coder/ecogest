"use client";

import React from "react";
import { BulletinViewerPage } from "@/components/school/BulletinViewerPage";

export default function DirecteurBulletinsPage() {
  return <BulletinViewerPage role="directeur" basePath="/directeur" />;
}
