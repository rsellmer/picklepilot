import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { appUsers } from "../../../../db/schema";
import { requireUser } from "../security";

export async function PATCH(request: Request) {
  const auth = await requireUser(request);
  if (auth.response) return auth.response;
  const input = (await request.json()) as { language?: string };
  if (input.language !== "fr" && input.language !== "en")
    return Response.json({ error: "Invalid language" }, { status: 400 });
  await getDb()
    .update(appUsers)
    .set({ preferredLanguage: input.language })
    .where(eq(appUsers.id, auth.user!.id));
  return Response.json({ language: input.language });
}
