import { getProject } from "@theatre/core";

export async function theatreInit() {
  await Promise.all([import("@theatre/studio")]).then(([studioModule]) => {
    const exported = studioModule.default as typeof studioModule.default & {
      default?: typeof studioModule.default;
    };

    const studio =
      typeof exported.initialize === "function" ? exported : exported.default;

    studio?.initialize();
  });
}

export const sheet = getProject("synthWave").sheet("synthSheet");
