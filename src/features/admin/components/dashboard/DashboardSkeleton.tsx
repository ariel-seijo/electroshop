"use client";

import Skeleton from "@/components/ui/Skeleton";

export default function DashboardSkeleton() {
  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6 max-md:grid-cols-2 max-[640px]:grid-cols-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[rgb(22,22,22)] border border-[rgb(40,40,40)] rounded-[10px] p-5 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-3">
              <Skeleton width="50%" height={14} />
              <Skeleton width={20} height={20} variant="circle" />
            </div>
            <Skeleton width="70%" height={32} />
          </div>
        ))}
      </div>

      <div className="bg-[rgb(22,22,22)] border border-[rgb(40,40,40)] rounded-[10px] p-[22px] mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
        <div className="flex items-baseline gap-3 mb-5">
          <Skeleton width="30%" height={16} />
          <Skeleton width="20%" height={12} />
        </div>
        <Skeleton width="100%" height={260} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
          <Skeleton width="30%" height={14} />
          <Skeleton width="25%" height={14} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 max-md:grid-cols-1">
        <div className="bg-[rgb(14,14,14)] border border-[rgb(40,40,40)] rounded-[10px] p-5 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5 mb-[18px] pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <Skeleton width={18} height={18} variant="circle" />
            <Skeleton width="50%" height={16} />
          </div>
          <table className="w-full border-collapse text-[0.8rem] [&_th]:text-left [&_th]:px-2.5 [&_th]:py-2 [&_th]:text-[0.65rem] [&_th]:font-semibold [&_th]:text-[rgb(145,145,145)] [&_th]:uppercase [&_th]:tracking-[0.8px] [&_th]:border-b [&_th]:border-[rgba(255,255,255,0.05)] [&_td]:p-2.5 [&_td]:border-b [&_td]:border-[rgba(255,255,255,0.03)] [&_td]:align-middle">
            <thead>
              <tr>
                <th><Skeleton width="100%" height={12} /></th>
                <th><Skeleton width="100%" height={12} /></th>
                <th><Skeleton width="100%" height={12} /></th>
                <th><Skeleton width="100%" height={12} /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td><Skeleton width="80%" height={14} /></td>
                  <td><Skeleton width="70%" height={14} /></td>
                  <td><Skeleton width={60} height={20} /></td>
                  <td><Skeleton width="70%" height={14} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-[rgb(14,14,14)] border border-[rgb(40,40,40)] rounded-[10px] p-5 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2.5 mb-[18px] pb-3 border-b border-[rgba(255,255,255,0.05)]">
            <Skeleton width={18} height={18} variant="circle" />
            <Skeleton width="50%" height={16} />
          </div>
          <div className="flex flex-col gap-3.5 flex-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-[rgba(255,255,255,0.02)] rounded-lg">
                <Skeleton width={24} height={24} variant="circle" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="80%" height={14} />
                  <Skeleton width="50%" height={12} />
                  <Skeleton width="100%" height={4} style={{ marginTop: 8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
