import { getBorderCharacters, table } from "table";
import { C_ERR, C_ERR_TEXT, C_SPEC, C_SUC, C_SUC_TEXT, C_TEXT, C_TEXT_BOLD } from "./utils/colours";
import { SpecResponse } from "./specResponse";

export class BundleResult {
  public bundlePath: string;
  public passedSpecs = 0;
  public allSpecs = 0;
  public passedTests = 0;
  public allTests = 0;
  public duration = 0;

  constructor(bundlePath: string) {
    this.bundlePath = bundlePath;
  }

  addResult(bundle: BundleResult) {
    this.passedSpecs += bundle.passedSpecs;
    this.allSpecs += bundle.allSpecs;
    this.passedTests += bundle.passedTests;
    this.allTests += bundle.allTests;
    this.duration += bundle.duration;
  }

  addResponses(responses: SpecResponse[]) {
    this.allSpecs += responses.length;
    for (const response of responses) {
      this.passedTests += response.passedTests;
      this.allTests += response.allTests;
      this.passedSpecs += response.passedTests === response.allTests ? 1 : 0;
    }
  }
}

export function displaySummary(bundleResults: BundleResult[]) {
  if (bundleResults.length) {
    const suite = new BundleResult("All Bundles");

    const data = [];
    data.push(["Bundle", "", "Specs", "Tests", "Duration"]);

    for (const bundle of bundleResults) {
      suite.addResult(bundle);
      data.push([
        renderBundle(bundle.bundlePath),
        renderCheck(bundle.passedSpecs, bundle.allSpecs),
        renderStatus(bundle.passedSpecs, bundle.allSpecs),
        renderStatus(bundle.passedTests, bundle.allTests),
        renderDuration(bundle.duration),
      ]);
    }
    if (bundleResults.length > 1) {
      data.push([
        renderBundle(suite.bundlePath),
        renderCheck(suite.passedSpecs, suite.allSpecs),
        renderStatus(suite.passedSpecs, suite.allSpecs),
        renderStatus(suite.passedTests, suite.allTests),
        renderDuration(suite.duration),
      ]);
    }

    const config = {
      border: getBorderCharacters("norc"),
      drawHorizontalLine: (lineIndex: number, rowCount: number) => {
        return lineIndex <= 1 || lineIndex >= rowCount - 1;
      },
    };

    process.stderr.write(`\n${table(data, config)}`);
  }
}

function renderBundle(bundlePath: string) {
  return C_TEXT_BOLD(bundlePath);
}

function renderCheck(passed: number, total: number) {
  return total === 0 ? C_TEXT("✓") : passed === total ? C_SUC("✓") : C_ERR("✗");
}

function renderStatus(passed: number, total: number) {
  if (total === 0) {
    return "---";
  }

  const score = Math.round((passed / total) * 100).toFixed(1);
  return passed === total
    ? C_SUC_TEXT(`${score}%`) +
        C_TEXT(" (") +
        C_SUC_TEXT(passed) +
        C_TEXT("/") +
        C_SPEC(total) +
        C_TEXT(")")
    : C_SUC_TEXT(`${score}%`) +
        C_TEXT(" (") +
        C_ERR_TEXT(total - passed) +
        C_TEXT("/") +
        C_SUC_TEXT(passed) +
        C_TEXT("/") +
        C_SPEC(total) +
        C_TEXT(")");
}

function renderDuration(duration: number) {
  return duration >= 1000
    ? C_TEXT(`${(duration / 1000).toFixed(3)} secs`)
    : C_TEXT(`${Math.round(duration).toFixed(0)} msecs`);
}

export function markdownSummary(bundleResults: BundleResult[]) {
  let report = "";
  report += "| Bundle |   | Specs | Tests | Duration |\n";
  report += "|--------|---|-------|-------|----------|\n";

  const suite = new BundleResult("All Bundles");
  for (const bundleResult of bundleResults) {
    suite.addResult(bundleResult);
    report += markdownRow(bundleResult.bundlePath, bundleResult);
  }

  report += markdownRow(`**${suite.bundlePath}**`, suite);
  report += "\n";

  function markdownRow(bundleName: string, bundleResult: BundleResult): string {
    const status =
      bundleResult.allTests === 0 || bundleResult.passedTests === bundleResult.allTests ? "✅" : "❌";

    const specs = markdownResult(bundleResult.passedSpecs, bundleResult.allSpecs);
    const tests = markdownResult(bundleResult.passedTests, bundleResult.allTests);

    const duration =
      bundleResult.duration >= 1000
        ? `${(bundleResult.duration / 1000).toFixed(3)} secs`
        : `${Math.round(bundleResult.duration).toFixed(0)} msecs`;

    return `| ${bundleName} | ${status} | ${specs} | ${tests} | ${duration} |\n`;
  }

  function markdownResult(passed: number, total: number) {
    if (total === 0) {
      return "`---`";
    }

    const score = Math.round((passed / total) * 100).toFixed(1);
    return passed === total
      ? `${score}% (\`${passed}\` / \`${total}\`)`
      : `${score}% (❌ \`${total - passed}\` / ✅ \`${passed}\` / \`${total}\`)`;
  }

  return report;
}
