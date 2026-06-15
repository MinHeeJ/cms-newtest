"use server";

export async function downloadArtifactAction(input: {
  draft_id: string;
  domain_code: string;
  filename: "spec.md" | "plan.md" | "tasks.md";
}) {
  return {
    ...input,
    requested_at: new Date().toISOString()
  };
}
