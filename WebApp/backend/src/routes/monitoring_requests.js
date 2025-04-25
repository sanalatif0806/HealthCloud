const fs = require('fs');
const path = require('path');
const simpleGit = require('simple-git');
const router = require('express').Router();
require('dotenv').config();

const LOCAL_REPO_PATH = path.resolve('local-clone');
const PROJECT_ROOT = path.resolve(__dirname, '../../../../');
const SOURCE_JSON_DIR = path.join(PROJECT_ROOT, 'monitoring_requests');

router.post('/submit', async (req, res) => {
  const fileData = req.body;
  const fileName = fileData.identifier || `request-${Date.now()}`;
  const monitoring_request = {};
  monitoring_request[fileData.identifier] = fileData;
  
  try {
    const git = simpleGit();
    if (!fs.existsSync(LOCAL_REPO_PATH)) {
      console.log(`Cloning repository to ${LOCAL_REPO_PATH}...`);
      await git.clone(process.env.REPO_URL.replace('https://', `https://${process.env.GIT_TOKEN}@`), LOCAL_REPO_PATH);
    }

    const repoGit = simpleGit(LOCAL_REPO_PATH);
    console.log('Pulling latest changes from main branch...');
    await repoGit.pull('origin', 'main');

    await repoGit.addConfig('user.name', process.env.GIT_USERNAME);
    await repoGit.addConfig('user.email', process.env.GIT_EMAIL);

    // Create the target directory in the repo
    const targetDir = path.join(LOCAL_REPO_PATH, 'monitoring_requests');
    fs.mkdirSync(targetDir, { recursive: true });

    // Write the JSON file directly to the target location in the repo
    const targetFilePath = path.join(targetDir, `${fileName}.json`);
    fs.writeFileSync(targetFilePath, JSON.stringify(monitoring_request, null, 2));
    console.log(`File written to: ${targetFilePath}`);
    console.log(`File exists: ${fs.existsSync(targetFilePath)}`);

    const timestamp = Date.now();
    let branchName = `monitoring-request-${fileData.identifier}-${timestamp}`;

    const existingBranches = await repoGit.branch();
    if (existingBranches.all.includes(branchName)) {
      branchName = `monitoring-request-${fileData.identifier}-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    }

    console.log(`Creating and checking out branch: ${branchName}`);
    await repoGit.checkoutLocalBranch(branchName);

    // Check for and remove Git lock file if it exists
    const gitLockPath = path.join(LOCAL_REPO_PATH, '.git', 'index.lock');
    if (fs.existsSync(gitLockPath)) {
      console.log('Removing Git lock file...');
      fs.unlinkSync(gitLockPath);
    }

    // Add the .json file to the git staging area
    console.log(`Adding file to Git: monitoring_requests/${fileName}.json`);
    await repoGit.add([`monitoring_requests/${fileName}.json`]);

    const statusAfterAdd = await repoGit.status();
    console.log('Git status after add:', statusAfterAdd);

    if (statusAfterAdd.staged.length === 0) {
      console.log('No files staged for commit!');
      return res.status(400).json({ success: false, error: 'No files staged for commit' });
    }

    // Commit the changes
    console.log('Committing changes...');
    await repoGit.commit(`Add monitoring request: ${fileName}`, undefined, { '--no-verify': null });

    // Force push the branch to remote
    console.log(`Pushing branch ${branchName} to origin...`);
    await repoGit.push('origin', branchName, { '--force': null });

    res.json({ 
      success: true, 
      message: 'Monitoring request committed and pushed!', 
      branch: branchName,
      file: `${fileName}.json`
    });
  } catch (error) {
    console.error('Error in submit endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;