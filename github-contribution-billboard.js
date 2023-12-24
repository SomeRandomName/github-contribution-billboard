const generateCommitDates = require("./generate-commit-dates");
const execPromise = require("./exec-promise");

const label = process.argv[2];
if (!label) {
  console.log("Please include a label. Here is an example: ");
  console.log("node github-contribution-billboard.js HACKER");
  return;
}

const isAlphaNumeric = (char) => {
  const charCode = char.charCodeAt(0);
  return (
    (charCode >= 48 && charCode <= 57) ||
    (charCode >= 65 && charCode <= 90) ||
    (charCode >= 97 && charCode <= 122)
  );
};
if (label.split("").some((char) => !isAlphaNumeric(char))) {
  console.log(
    "Please use only alphanumeric characters for your label. Here is an example: "
  );
  console.log("node github-contribution-billboard.js HACKER");
  return;
}

const capitalizedLabel = label.toUpperCase();

const dates = generateCommitDates(capitalizedLabel);

(async () => {
  try {
    await execPromise("git branch disposable -D");
    await execPromise("git push origin disposable --delete");
  } catch (e) {
    // no-op
    // This can happen on first run
  }
  await execPromise("git checkout -b disposable");

  console.log(
    "Starting process to create commits, this can take up to 30 seconds to complete"
  );

  const commitCount = 30;
  for (const date of dates) {
    console.log("Creating commits for: ", date);
    for (const _ of Array.from({ length: commitCount })) {
      await execPromise(
        `git commit --date "${date}" -m "billboarding" --allow-empty`
      );
    }
  }
  await execPromise("git push origin disposable --force");
  await execPromise("git checkout main");
})();
