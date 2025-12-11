import type { Effect, EventRule, NormalizedSpawnEvent, ReactionContext } from "./types";

async function runEffect(effect: Effect, ctx: ReactionContext) {
  switch (effect.type) {
    case "stopServer":
      await ctx.stopServer(ctx.serverName, ctx.username);
      return;
    case "navigateOptions":
      ctx.navigateToOptions({ error: effect.error });
      return;
    case "setStatus":
      ctx.setUiStatus({ status: effect.status, message: effect.message });
      return;
    case "toast":
      ctx.toast?.({
        title: effect.title,
        description: effect.description,
        variant: effect.variant,
      });
      return;
  }
}

export async function handleSpawnEvent(event: NormalizedSpawnEvent, rules: EventRule[], ctx: ReactionContext) {
  for (const rule of rules) {
    if (rule.when(event)) {
      for (const eff of rule.effects) {
        await runEffect(eff, ctx);
      }
      if (rule.stopPropagation) break;
    }
  }
}
