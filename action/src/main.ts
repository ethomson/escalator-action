import * as core from '@actions/core'
import url from 'url'
import http from 'http'
import https from 'https'
import fs from 'fs'

//const hostname = 'escalatoraction.azurewebsites.net';
//const url = 'http://localhost:3000/';

const PROJECT_NAME = 'escalator'
const VERSION = '0.0.1'

function parseUrl(inputUrl: string): url.UrlWithStringQuery {
  if (!inputUrl) {
    throw new Error('url is not set')
  }

  const serverUrl = url.parse(inputUrl)

  if (
    (serverUrl.protocol != 'http:' && serverUrl.protocol != 'https:') ||
    !serverUrl.hostname
  ) {
    throw new Error('url is not valid')
  }

  if (serverUrl.protocol == 'http:' && !serverUrl.port) {
    serverUrl.port = '80'
  }
  if (serverUrl.protocol == 'https:' && !serverUrl.port) {
    serverUrl.port = '443'
  }

  if (!serverUrl.path) {
    serverUrl.path = '/'
  }

  return serverUrl
}

async function run(): Promise<void> {
  try {
    const serverUrl = parseUrl('https://escalatoraction.azurewebsites.net')
    const payloadPath = process.env.GITHUB_EVENT_PATH

    if (!payloadPath) {
      throw new Error('GITHUB_EVENT_PATH is not set')
    }

    const payload = fs.readFileSync(payloadPath, 'utf8')
    const query = `payload=${payload}`

    const options = {
      method: 'POST',
      hostname: serverUrl.hostname as string,
      port: serverUrl.port as string,
      path: serverUrl.path as string,
      headers: {
        Host: serverUrl.hostname as string,
        'User-Agent': `${PROJECT_NAME}/${VERSION}`,
        'Content-Length': query.length
      }
    }

    return new Promise((resolve, reject) => {
      const proto = serverUrl.protocol == 'https:' ? https : http
      const request = proto.request(options)

      request.on('response', response => {
        if (response.statusCode != 200 && response.statusCode != 204) {
          reject(
            new Error(
              `Invalid response: ${response.statusCode} ${response.statusMessage}`
            )
          )
        }

        response.on('data', data => {})
        response.on('end', () => {
          resolve()
        })
      })
      request.on('error', error => {
        reject(error)
      })
      request.write(query)
      request.end()
    })
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
