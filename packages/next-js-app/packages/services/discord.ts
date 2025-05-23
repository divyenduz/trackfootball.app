interface CreateDiscordMessageArgs {
  heading?: string
  name: string
  description: string
}

export async function createDiscordMessage({
  heading,
  name,
  description,
}: CreateDiscordMessageArgs) {
  // if (process.env.NODE_ENV !== 'production') {
  //   return
  // }

  const content = `
      ## ${heading}
      
      Name: ${name}
      Time: ${new Date().toLocaleDateString()}
      Description: ${description}
          `

  const form = new FormData()
  form.append('content', content)

  try {
    await fetch(process.env.DISCORD_TRACKFOOTBALL_APPLICATION_EVENTS_WEBHOOK, {
      method: 'POST',
      body: form,
    })
  } catch (e) {
    console.error(e)
  }

  return true
}
