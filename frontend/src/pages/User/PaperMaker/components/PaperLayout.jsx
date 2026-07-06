import React from "react";
import MakerTopbar from "./MakerTopbar";
import MakerSidebar from "./MakerSidebar";

const PaperLayout = ({
  children,
  paperData,
  isSidebarCollapsed,
  toggleSidebar,
  isMenuOpen,
  onOpenMenu,
  onCancel,
  onSave,
  onPrint,
  isManualMode,
  toggleManualMode,
}) => {
  return (
    <div className="flex flex-col h-screen w-full min-w-7xl bg-bg-body overflow-hidden font-sans text-main transition-colors duration-300">
      <MakerTopbar toggleSidebar={toggleSidebar} />

      {/* ✅ FIX: Background changed from bg-slate-100 to bg-bg-body to match the theme. 
          This removes the ugly white space behind and below the sidebar. */}
      <div className="flex flex-1 overflow-hidden w-full h-full bg-bg-body transition-colors duration-300">
        {/* SIDEBAR */}
        <div className="h-full z-40 shrink-0 py-4 pl-4 flex flex-col">
          <MakerSidebar
            paperData={paperData}
            onOpenMenu={onOpenMenu}
            isMenuOpen={isMenuOpen}
            isCollapsed={isSidebarCollapsed}
            onCancel={onCancel}
            onSave={onSave}
            onPrint={onPrint}
            isManualMode={isManualMode}
            toggleManualMode={toggleManualMode}
          />
        </div>

        {/* PAPER CANVAS */}
        <div className="flex-1 h-full overflow-y-auto px-4 custom-scrollbar relative">
          {/* ✅ FIX: Changed background from bg-white to bg-card and text to text-main. 
              Now the paper will beautifully turn dark when dark mode is on, 
              but will still print perfectly white (print:bg-white print:text-black). */}
          <div className="w-full min-h-[calc(100vh-6rem)] bg-card text-main rounded-t-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 sm:p-8 mt-4 pb-20 print:mt-0 print:mb-0 print:p-0 print:shadow-none print:bg-white print:text-black print:rounded-none relative z-10 transition-colors duration-300">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperLayout;
