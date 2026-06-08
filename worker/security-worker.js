const { createClient } = require("@supabase/supabase-js");

const supabase =
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

async function runSecurityChecks() {
  console.log("Running security worker...");

  const { data: companies, error } =
    await supabase
      .from("companies")
      .select("id");

  if (error) {
    console.error(error.message);
    return;
  }

  for (const company of companies || []) {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/security/incidents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_id: company.id,
          }),
        }
      );

      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/security/risk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_id: company.id,
          }),
        }
      );

      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/security/compliance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_id: company.id,
          }),
        }
      );

      console.log(
        `Security checks completed for ${company.id}`
      );
    } catch (err) {
      console.error(
        `Security worker failed for ${company.id}`,
        err
      );
    }
  }
}

runSecurityChecks();
