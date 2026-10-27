import { redirect } from "next/navigation";

/** Old address kept so existing links keep working. */
export default function CompleteProfileRedirect() {
  redirect("/client/complete-registration");
}
