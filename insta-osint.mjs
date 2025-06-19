import puppeteer from "puppeteer"; // replaces axios + cheerio
import chalk from "chalk"; // colorful CLI
import inquirer from "inquirer"; // interactive CLI
import figlet from "figlet"; // ASCII banner
import gradient from "gradient-string"; // rainbow color effect

console.clear();

console.log(
  gradient.pastel(
    figlet.textSync("INSTA OSINT", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  )
);

console.log(chalk.yellow.bold("\n🔧 Developed by: Sahil Jogi\n"));

const startScan = async () => {
  try {
    const { username } = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: chalk.white(
          "🔍 Enter Instagram username (or type 'exit' to quit):"
        ),
      },
    ]);

    await getUserData(username);
  } catch (err) {
    console.log(chalk.red("❌ Unexpected error during prompt."));
    console.log(chalk.gray(err.message));
  }

  // Ask again after one completes
  console.log(chalk.gray("\n🔄 Restarting...\n"));
  setTimeout(startScan, 1000); // Optional delay before next scan
};

const getUserData = async (username) => {
  try {
    if (username.toLowerCase() === "exit") {
      console.log(chalk.green("👋 Exiting. Thanks for using INSTA OSINT!"));
      process.exit();
    }

const browser = await puppeteer.launch({
  headless: "new",
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});

    const page = await browser.newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("meta[property='og:title']", { timeout: 10000 });

    const userData = await page.evaluate(() => {
      const getMeta = (property) =>
        document
          .querySelector(`meta[property="${property}"]`)
          ?.getAttribute("content") || "N/A";

      return {
        fullName: getMeta("og:title"),
        description: getMeta("og:description"),
        profilePic: getMeta("og:image"),
        profileUrl: getMeta("og:url"),
      };
    });

    await browser.close();

    const [followers, following, posts] = userData.description
      .split(" - ")[0]
      .split(",")
      .map((s) => s.trim());

    console.log(chalk.green(`\n📄 Username: ${username}`));
    console.log(chalk.yellow(`📛 Full Name: ${userData.fullName}`));
    console.log(chalk.cyan(`📝 Bio: ${userData.description}`));
    console.log(chalk.blue(`🔗 Profile URL: ${userData.profileUrl}`));
    console.log(chalk.magenta(`📷 Profile Pic: ${userData.profilePic}`));
    console.log(chalk.white(`👥 Followers: ${followers}`));
    console.log(chalk.white(`👤 Following: ${following}`));
    console.log(chalk.white(`📸 Posts: ${posts}`));
    console.log();
  } catch (err) {
    console.log(
      chalk.red(
        "❌ Failed to fetch data. Profile may not exist or content is blocked."
      )
    );
    console.log(chalk.gray(err.message));
  }
};

// 🚀 Start the loop
startScan();
