import { type NextRequest, NextResponse } from "next/server"

// Sample data for AI responses
const creativeAccounts = [
  { username: "visualstoryteller", description: "Creates stunning visual narratives through short videos" },
  { username: "techcrafter", description: "DIY tech projects and gadget reviews" },
  { username: "naturelens", description: "Breathtaking nature and wildlife footage" },
  { username: "urbanexplorer", description: "Discovering hidden gems in cities around the world" },
  { username: "culinaryartist", description: "Food preparation as an art form" },
]

const trendingAccounts = [
  { username: "trendwatcher", description: "Always ahead of the latest social media trends" },
  { username: "musicpulse", description: "Sharing the hottest new music tracks and artists" },
  { username: "fashionforward", description: "Cutting-edge fashion and style inspiration" },
  { username: "gamingpro", description: "Expert gameplay and gaming industry insights" },
  { username: "fitnessguru", description: "Innovative workout routines and health tips" },
]

const contentIdeas = [
  "Share a day-in-the-life video showing your routine",
  "Create a tutorial on something you're skilled at",
  "Start a weekly challenge and invite others to participate",
  "React to a trending topic with your unique perspective",
  "Do a before-and-after transformation post",
  "Share your workspace or creative environment",
  "Create a 'Top 5' list related to your interests",
  "Post a throwback photo/video with a story behind it",
  "Share a work-in-progress to engage your audience",
  "Ask your followers a question to boost engagement",
]

export async function POST(request: NextRequest) {
  try {
    const { message, username } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Process the message and generate a response
    let response = ""
    const lowerMessage = message.toLowerCase()

    // Check for account recommendations
    if (
      lowerMessage.includes("account") ||
      lowerMessage.includes("follow") ||
      lowerMessage.includes("creator") ||
      lowerMessage.includes("who") ||
      lowerMessage.includes("recommend")
    ) {
      // Determine if looking for creative or trending accounts
      const accounts = lowerMessage.includes("creative") ? creativeAccounts : trendingAccounts

      // Randomly select 3 accounts
      const shuffled = [...accounts].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 3)

      response = `Here are some accounts I think you might enjoy following:\n\n${selected
        .map((account, index) => `${index + 1}. **@${account.username}**: ${account.description}`)
        .join("\n\n")}\n\nWould you like more recommendations or specific types of content creators?`
    }
    // Check for content ideas
    else if (
      lowerMessage.includes("idea") ||
      lowerMessage.includes("post") ||
      lowerMessage.includes("content") ||
      lowerMessage.includes("create") ||
      lowerMessage.includes("make") ||
      lowerMessage.includes("suggest")
    ) {
      // Randomly select 5 content ideas
      const shuffled = [...contentIdeas].sort(() => 0.5 - Math.random())
      const selected = shuffled.slice(0, 5)

      response = `Here are some content ideas for your next post:\n\n${selected
        .map((idea, index) => `${index + 1}. ${idea}`)
        .join("\n\n")}\n\nLet me know if you'd like more specific ideas based on a particular theme!`
    }
    // Handle greetings
    else if (
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("greetings")
    ) {
      response = `Hello${
        username ? ` ${username}` : ""
      }! I'm Fuze, your AI assistant for Fusion Connect. I can help you discover interesting accounts to follow and give you ideas for your next post. How can I help you today?`
    }
    // Handle questions about the AI
    else if (
      lowerMessage.includes("who are you") ||
      lowerMessage.includes("what are you") ||
      lowerMessage.includes("about you")
    ) {
      response = `I'm Fuze, the AI assistant for Fusion Connect! I'm here to help you discover great content creators to follow and provide inspiration for your own posts. I can suggest trending topics, content ideas, and help you connect with like-minded creators. What would you like help with today?`
    }
    // Handle thanks
    else if (lowerMessage.includes("thank") || lowerMessage.includes("thanks") || lowerMessage.includes("appreciate")) {
      response = `You're welcome! I'm happy to help. Is there anything else you'd like assistance with?`
    }
    // Default response for other queries
    else {
      response = `I'm not sure I understand what you're looking for. I can help you discover accounts to follow or suggest content ideas for your posts. Would you like me to recommend some creative accounts or provide some post inspiration?`
    }

    // Add a small delay to simulate thinking
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error processing AI request:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
