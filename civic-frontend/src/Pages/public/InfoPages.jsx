
import React from "react";
import { Link } from "react-router-dom";

const Wrapper = ({ title, children }) => (
  <div className="max-w-3xl mx-auto px-4 py-10">
    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
      {title}
    </h1>
    <div className="space-y-4 text-slate-600 dark:text-slate-300 leading-relaxed">
      {children}
    </div>
    <Link
      to="/"
      className="inline-block mt-8 text-teal-600 hover:text-teal-500 font-medium"
    >
      &larr; Back to Home
    </Link>
  </div>
);

export const PrivacyPolicy = () => (
  <Wrapper title="Privacy Policy">
    <p>
      CivicSense only collects the information needed to run the platform: your
      name, email, phone number, and the issues you report (including location
      and photos).
    </p>
    <p>
      Your password is stored only in encrypted form. We never share your
      personal details with other citizens. Only the admin and the official
      assigned to your issue can see the issue details.
    </p>
    <p>
      If you want your account or data removed, please contact the Help Desk.
    </p>
  </Wrapper>
);

export const TermsOfService = () => (
  <Wrapper title="Terms of Service">
    <p>
      By using CivicSense you agree to report only genuine civic issues with
      correct details and photos.
    </p>
    <p>
      False, abusive or spam reports may be rejected, and the account may be
      blocked by the admin.
    </p>
    <p>
      Officials must update the status of their assigned issues honestly.
      Resolution times depend on the department and are not guaranteed.
    </p>
  </Wrapper>
);

export const HelpDesk = () => (
  <Wrapper title="Help Desk">
    <p>Need help? Here are the common answers:</p>
    <ul className="list-disc pl-6 space-y-2">
      <li>
        <strong>Report an issue:</strong> Login as a citizen and use the Report
        Issue page. Add a clear title, description and location.
      </li>
      <li>
        <strong>Track an issue:</strong> Open My Reports to see the status and
        timeline of each issue.
      </li>
      <li>
        <strong>Issue not verified yet:</strong> The admin first verifies each
        issue, then assigns it to an official.
      </li>
      <li>
        <strong>Account blocked or other problem:</strong> Please contact the
        CivicSense admin.
      </li>
    </ul>
  </Wrapper>
);