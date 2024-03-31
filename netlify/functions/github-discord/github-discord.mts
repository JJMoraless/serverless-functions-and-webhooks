import type { Context } from '@netlify/functions'

const notify = async (message: string) => {
  const body = {
    content: message,
    embeds: [
      {
        image: {
          url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGpxdXZ6bXZqbXN3ajN2aGhlaGRkODJsaDdmN2ZnNDNueXNvazVzZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/gITPbRsMei2mVxZxHK/giphy.gif',
        },
      },
    ],
  }

  const discordWebhookUrl = process.env.DISCORD_URL
  if (!discordWebhookUrl) {
    console.log('DISCORD_URL is not defined')
  }

  const res = await fetch(discordWebhookUrl || '', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    console.log('Error sending message to discord')
    return false
  }

  return true
}

const onStar = (payload: any): string => {
  const { action, starred_at, sender, repository } = payload

  return `✨ action: ${action}, starred_at: ${starred_at || 'N/A'}, sender: ${
    sender.login
  }, repository: ${repository.full_name}`
}

const onIssue = (payload: any): string => {
  const { action, issue } = payload

  if (action == 'opened') {
    return `🐙 An issue was opened  with this title: ${issue.title}`
  }

  if (action == 'closed') {
    return `🐙 An issue was closed by: ${issue.user.login}`
  }

  if (action == 'reopened') {
    return `🐙 An issue was reopened by: ${issue.user.login}`
  }

  return `An issue was ${action} with this title: ${issue.title}`
}

export default async (req: Request, context: Context) => {
  let statusCode = 200
  const responseBody: { error?: string; ok?: string } = {}
  const githubEvent = req.headers.get('x-github-event') as string
  let payload

  if (req.body) {
    const reader = req.body.getReader()
    const result = await reader.read()
    const decoder = new TextDecoder('utf-8')
    const text = decoder.decode(result.value)
    payload = JSON.parse(text)
  }

  let message: string = ''
  if (githubEvent === 'star') {
    message = onStar(payload)
  }

  if (githubEvent === 'issues') {
    message = onIssue(payload)
  }

  console.log({ message, payload })

  const resNotify = await notify(message)
  if (!resNotify) {
    statusCode = 500
    responseBody.error = 'Error sending message to discord'
  } else {
    responseBody.ok = message
  }

  const resBody = JSON.stringify(responseBody)

  return new Response(resBody, {
    status: statusCode,
    headers: {
      'content-type': 'application/json',
    },
  })
}
