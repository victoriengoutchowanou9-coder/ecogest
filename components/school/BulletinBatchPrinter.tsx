"use client";

import React from "react";
import { ComputedBulletin } from "@/lib/types/bulletin";
import { BeninOfficialBulletin } from "./BeninOfficialBulletin";

interface BulletinBatchPrinterProps {
  bulletins: ComputedBulletin[];
  customLogoUrl?: string;
}

export const BulletinBatchPrinter: React.FC<BulletinBatchPrinterProps> = ({
  bulletins,
  customLogoUrl,
}) => {
  return (
    <div className="bulletin-batch-container space-y-8 print:space-y-0">
      {bulletins.map((bulletin, index) => (
        <div
          key={bulletin.student.id}
          className="print-page-break print:h-[297mm] print:overflow-hidden print:m-0 print:p-0"
          style={{
            pageBreakAfter: index < bulletins.length - 1 ? "always" : "auto",
            breakAfter: index < bulletins.length - 1 ? "page" : "auto",
          }}
        >
          <BeninOfficialBulletin
            bulletin={bulletin}
            customLogoUrl={customLogoUrl}
          />
        </div>
      ))}
    </div>
  );
};
