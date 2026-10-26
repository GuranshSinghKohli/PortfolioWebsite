import { describe, expect, it } from "vitest";

import { answers, homeChips } from "@/content/answers";
import { projects } from "@/content/projects";
import { roles } from "@/content/roles";

const answerIds = new Set(answers.map((answer) => answer.id));
const roleIds = new Set(roles.map((role) => role.id));
const slugs = new Set(projects.map((project) => project.slug));

describe("content", () => {
  it("has unique ids", () => {
    expect(answerIds.size).toBe(answers.length);
    expect(roleIds.size).toBe(roles.length);
    expect(slugs.size).toBe(projects.length);
  });

  it("attaches only roles and projects that exist", () => {
    for (const answer of answers) {
      for (const attachment of answer.attachments) {
        if (attachment.kind === "roles") {
          for (const id of attachment.ids) expect(roleIds, answer.id).toContain(id);
        }
        if (attachment.kind === "projects") {
          for (const slug of attachment.slugs) expect(slugs, answer.id).toContain(slug);
        }
      }
    }
  });

  it("points follow-ups and chips at curated answers", () => {
    for (const answer of answers) {
      for (const id of answer.followUps) expect(answerIds, answer.id).toContain(id);
    }
    for (const id of [...homeChips.about, ...homeChips.work]) {
      expect(answerIds).toContain(id);
    }
  });

  it("has written text for every curated answer", () => {
    for (const answer of answers) expect(answer.answer, answer.id).not.toContain("[fill in");
  });

  it("gives every role and project a curated answer", () => {
    for (const role of roles) expect(answerIds).toContain(`role:${role.id}`);
    for (const project of projects) expect(answerIds).toContain(`project:${project.slug}`);
  });
});
