import { SubmitForm } from "@/components/compensation/submit-form";

export const metadata = {
  title: "Add Salary — CompensIQ",
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Your Salary</h1>
        <p className="mt-1 text-sm text-gray-500">
          Submissions are 100% anonymous. Help others benchmark their compensation.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
