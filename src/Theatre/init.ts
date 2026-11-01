import { getProject } from "@theatre/core";
import state from "./synthWave.theatre-project-state.json";

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

const project = getProject("synthWave", { state });
export const sheet = project.sheet("synthSheet");

project.ready.then(() => {
  sheet.sequence.play({ iterationCount: Infinity });
});
