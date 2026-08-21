import { redirect } from "next/navigation";

export default function TestimonialsAdminPage() {
  redirect("/settings?tab=testimonials");
}
