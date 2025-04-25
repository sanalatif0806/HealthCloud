const fs = require('fs');
const path = require('path');
const fileURLToPath = require('url')
const simpleGit = require('simple-git')
const router = require('express').Router();
require('dotenv').config();

const LOCAL_REPO_PATH = path.resolve('local-clone')
const PROJECT_ROOT = path.resolve(__dirname, '../../../../')
const SOURCE_JSON_DIR = path.join(PROJECT_ROOT, 'monitoring_requests')

router.post('/submit', async (req, res) => {
    const fileData = req.body
    const fileName = fileData.identifier || `request-${Date.now()}.json`
    const monitoring_request = {}
    monitoring_request[fileData.identifier] = fileData
    try {
      // Clona la repo se non esiste localmente
      const git = simpleGit()
      if (!fs.existsSync(LOCAL_REPO_PATH)) {
        await git.clone(process.env.REPO_URL.replace('https://', `https://${process.env.GIT_TOKEN}@`), LOCAL_REPO_PATH)
      }
  
      const repoGit = simpleGit(LOCAL_REPO_PATH)
      await repoGit.pull('origin', 'main')
  
      await repoGit.addConfig('user.name', process.env.GIT_USERNAME)
      await repoGit.addConfig('user.email', process.env.GIT_EMAIL)

      // Copia il file nella cartella della repo da pushare
      const targetDir = path.join(LOCAL_REPO_PATH, 'monitoring_requests')
      fs.mkdirSync(targetDir, { recursive: true })
  
      const sourcePath = path.join(SOURCE_JSON_DIR, fileName + '.json')
      fs.writeFileSync(sourcePath, JSON.stringify(monitoring_request, null, 2)) 
      fs.copyFileSync(sourcePath, path.join(targetDir, fileName))
  
      // Crea una nuova branch e fai il commit
      const branchName = `monitoring-request-${Date.now()}`
      await repoGit.checkoutLocalBranch(branchName)
      const gitLockPath = path.join(LOCAL_REPO_PATH, '.git', 'index.lock')
        if (fs.existsSync(gitLockPath)) {
          fs.unlinkSync(gitLockPath)
      }
      await repoGit.add('./*')
      await repoGit.commit(`Add monitoring request: ${fileName}`)
      await repoGit.push('origin', branchName)
  
      res.json({ success: true, message: 'Monitoring request committed and pushed!', branch: branchName })
    } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, error: error.message })
    }
  })

module.exports = router;