from langchain_google_genai import ChatGoogleGenerativeAI
from browser_use import Agent
import asyncio
import os

# Pega aquí tu API Key de Google AI Studio
os.environ["GOOGLE_API_KEY"] = "TU_API_KEY_AQUÍ"

async def main():
    # Usamos Gemini 2.0 Flash por su velocidad
    llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash")
    
    # Misión de prueba para validar tu trabajo de hoy
    agent = Agent(
        task="Ve a https://www.cryptocollege.online, verifica que cargue el título y dime si ves el favicon nuevo.",
        llm=llm,
    )
    
    result = await agent.run()
    print(result)

if __name__ == "__main__":
    asyncio.run(main())
