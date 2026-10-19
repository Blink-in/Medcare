import HomeReveal from "./HomeReveal";

const HomeSectionHeading = ({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  children,
}) => {
  const centered = align === "center";
  const dark = tone === "dark";

  return (
    <HomeReveal
      className={`mb-12 flex flex-col gap-6 sm:mb-14 ${
        centered
          ? "mx-auto max-w-2xl items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={centered ? "" : "max-w-2xl"}>
        {eyebrow && (
          <p
            className={`inline-flex items-center gap-2 text-sm font-semibold ${
              dark ? "text-green-300" : "text-green-700"
            }`}
          >
            <span
              className={`h-1.5 w-6 rounded-full ${
                dark ? "bg-green-400" : "bg-green-600"
              }`}
            />
            {eyebrow}
          </p>
        )}

        <h2
          className={`font-display mt-3 text-3xl font-semibold leading-[1.1] tracking-tight sm:text-5xl ${
            dark ? "text-white" : "text-slate-900"
          }`}
        >
          {title}
        </h2>

        {description && (
          <p
            className={`mt-4 max-w-xl text-base leading-7 sm:text-lg ${
              dark ? "text-green-100/75" : "text-slate-600"
            }`}
          >
            {description}
          </p>
        )}
      </div>

      {children}
    </HomeReveal>
  );
};

export default HomeSectionHeading;
