import asyncio
from sqlmodel import SQLModel
from sqlalchemy import select
from app.database import async_session, engine, init_db
from app.models.wing import Wing
import app.models.activity
import app.models.photo


async def reset_db():
    async with engine.begin() as conn:
        print("Dropping existing tables...")
        await conn.run_sync(SQLModel.metadata.drop_all)
        print("Creating new tables...")
        await conn.run_sync(SQLModel.metadata.create_all)


async def seed_wings():
    wings_data = [
        {
            "name": "CodeZero",
            "slug": "codezero",
            "about": "CodeZero is the technical wing of Anvaya Club, dedicated to promoting coding culture and technical skills among students. We organize workshops, hackathons, and coding competitions to enhance programming proficiency.",
            "vision": "To create a vibrant community of skilled programmers and problem solvers who contribute to technological advancement.",
            "mission": "To organize regular coding workshops, hackathons, and technical sessions that empower students with cutting-edge programming skills and industry-relevant knowledge.",
        },
        {
            "name": "Kalavaibhava",
            "slug": "kalavaibhava",
            "about": "Kalavaibhava is the cultural wing of Anvaya Club, celebrating arts, traditions, and cultural diversity. We organize cultural events, competitions, and festivals to showcase student talent.",
            "vision": "To preserve and promote rich cultural heritage while fostering creativity and artistic expression among students.",
            "mission": "To conduct diverse cultural events, competitions, and celebrations that provide a platform for students to explore and exhibit their artistic talents.",
        },
        {
            "name": "SheSpark",
            "slug": "shespark",
            "about": "SheSpark is dedicated to women empowerment in technology and engineering. We create an inclusive environment that supports and encourages women students in their academic and professional journey.",
            "vision": "To build a strong community of empowered women leaders in technology who inspire and mentor future generations.",
            "mission": "To provide mentorship, networking opportunities, and skill development programs that empower women students to excel in technology and leadership roles.",
        },
        {
            "name": "UGRS",
            "slug": "ugrs",
            "about": "UGRS (Undergraduate Research Society) is focused on promoting research culture among undergraduate students. We facilitate research projects, paper publications, and academic collaborations.",
            "vision": "To establish a thriving research ecosystem that encourages undergraduate students to contribute to scientific knowledge and innovation.",
            "mission": "To support student research initiatives, facilitate paper publications, and create opportunities for collaboration with industry and academia.",
        },
        {
            "name": "Udbhava",
            "slug": "udbhava",
            "about": "Udbhava is the innovation and entrepreneurship wing of Anvaya Club. We nurture startup ideas, foster innovation, and support student entrepreneurs in building their ventures.",
            "vision": "To cultivate an entrepreneurial mindset and create successful startups that solve real-world problems and contribute to economic growth.",
            "mission": "To provide incubation support, mentorship, and resources for student startups while organizing innovation challenges and entrepreneurship workshops.",
        },
    ]
    
    async with async_session() as session:
        result = await session.execute(select(Wing))
        if result.scalars().first():
            print("Wings already exist, skipping seed.")
            return

        for wing_data in wings_data:
            wing = Wing(**wing_data)
            session.add(wing)
        
        await session.commit()
        print("✓ Successfully created 5 wing entries!")
        print("\nℹ️  Note: No sample activities or photos added. Use the admin panel to add content.")


async def main():
    print("Initializing database...")
    await reset_db()
    print("✓ Database tables recreated!")
    
    print("\nSeeding wings data...")
    from sqlalchemy import select
    await seed_wings()
    
    print("\n✨ Database setup complete!")
    
    print("\nSeeding wings data...")
    await seed_wings()
    
    print("\n✨ Database setup complete!")


if __name__ == "__main__":
    asyncio.run(main())
