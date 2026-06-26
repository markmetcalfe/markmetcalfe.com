export default {
  async fetch(_request: Request, env: Env) {
    try {
      const assetResponse = await fetchResumeAsset('pdf', env)

      return new Response(await assetResponse.arrayBuffer(), {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': 'attachment; filename="Mark Metcalfe Resume.pdf"',
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'X-Message-From-Mark': 'Thanks for checking out my resume!',
        },
      })
    }
    catch (error) {
      return new Response(
        error instanceof Error ? error.message : String(error),
        { status: 500 },
      )
    }
  },
}

async function fetchResumeAsset(format: string, env: Env): Promise<Response> {
  const resumeResponse = await fetch(
    'https://api.github.com/repos/markmetcalfe/resume/releases/latest',
    {
      headers: {
        'Authorization': `Bearer ${env.GITHUB_API_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'markmetcalfe.com-api',
      },
    },
  )

  if (!resumeResponse.ok) {
    throwError(await resumeResponse.text())
  }

  const releaseData = await resumeResponse.json() as unknown as { assets: { name: string, url: string }[] }
  const resumeAsset = releaseData.assets.find(
    (asset: { name: string, url: string }) => asset.name === `resume.${format}`,
  )

  if (!resumeAsset) {
    throwError(JSON.stringify(releaseData))
  }

  const assetResponse = await fetch(resumeAsset.url, {
    headers: {
      'Authorization': `Bearer ${env.GITHUB_API_TOKEN}`,
      'Accept': 'application/octet-stream',
      'User-Agent': 'markmetcalfe.com-api',
    },
  })

  if (!assetResponse.ok) {
    throwError(await assetResponse.text())
  }

  return assetResponse
}

function throwError(debugData: string): never {
  throw new Error(`Failed to download resume PDF.\nPlease contact me directly at mark@markmetcalfe.com for a copy.\n\nError debug data: ${debugData}`)
}
