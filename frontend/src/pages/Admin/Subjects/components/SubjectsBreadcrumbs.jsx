import React from "react";
import { Layers, BookOpen, FolderTree, Check, ChevronRight } from "lucide-react";

const SubjectsBreadcrumbs = ({
  activeStep,
  selectedClass,
  selectedSubject,
  onStepClick,
}) => {
  const steps = [
    {
      id: 1,
      name: "Class Level",
      subtitle: selectedClass ? selectedClass.name : "Select Grade",
      icon: Layers,
      isCompleted: activeStep > 1 && !!selectedClass,
      isActive: activeStep === 1,
      isClickable: true,
    },
    {
      id: 2,
      name: "Subject",
      subtitle: selectedSubject ? selectedSubject.subjectName : "Select Subject",
      icon: BookOpen,
      isCompleted: activeStep > 2 && !!selectedSubject,
      isActive: activeStep === 2,
      isClickable: !!selectedClass,
    },
    {
      id: 3,
      name: "Chapters & Topics",
      subtitle: selectedSubject ? "Manage Hierarchy" : "Select Chapter",
      icon: FolderTree,
      isCompleted: false,
      isActive: activeStep === 3,
      isClickable: !!selectedClass && !!selectedSubject,
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Step Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => step.isClickable && onStepClick(step.id)}
                  disabled={!step.isClickable}
                  className={`flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                    step.isActive
                      ? "bg-accent-1/10 border-accent-1/40 ring-2 ring-accent-1/20 shadow-xs cursor-default"
                      : step.isCompleted
                      ? "bg-card hover:bg-pill-bg border-emerald-500/30 dark:border-emerald-500/20 cursor-pointer"
                      : "bg-pill-bg/50 border-border/50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  {/* Step Indicator / Icon */}
                  <div
                    className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      step.isActive
                        ? "bg-accent-1 text-white shadow-md shadow-accent-1/30 font-bold text-sm"
                        : step.isCompleted
                        ? "bg-emerald-500 text-white shadow-sm font-bold text-sm"
                        : "bg-pill-bg border border-border text-muted text-xs font-semibold"
                    }`}
                  >
                    {step.isCompleted ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Labels */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                        Step {step.id}
                      </span>
                      {step.isCompleted && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          Done
                        </span>
                      )}
                    </div>
                    <h4
                      className={`text-sm font-bold truncate ${
                        step.isActive
                          ? "text-accent-1"
                          : step.isCompleted
                          ? "text-main"
                          : "text-muted"
                      }`}
                    >
                      {step.name}
                    </h4>
                    <p className="text-xs text-muted truncate font-medium mt-0.5">
                      {step.subtitle}
                    </p>
                  </div>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SubjectsBreadcrumbs;
