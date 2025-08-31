import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import clientPromise from "../../../../../lib/mongo";
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

// Define a minimal User type for the return value
type CredentialsUser = {
    id: string;
    email: string;
    name: string | null;
};

const authOptions: AuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },
    providers: [
        CredentialsProvider({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials) return null;
                try {
                    const client: MongoClient = await clientPromise;
                    const userCollection = client.db("DATABASE_UD").collection("User");
                    const user = await userCollection.findOne({ email: credentials.email });

                    if (!user) {
                        console.log("User Not Found", credentials.email);
                        return null;
                    }
                    const passwordsMatch = await bcrypt.compare(credentials.password, user.password);
                    if (!passwordsMatch) {
                        console.log("Password MisMatch for user ", credentials.email);
                        return null;
                    }

                    console.log("User Authenticated successfully", credentials.email);
                    // Return a plain object, not cast as User
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name ?? null,
                    } as CredentialsUser;
                } catch (err) {
                    console.log("Authorize error (credentials)", err);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: "/Login"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.email = user.email;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                // Assign directly, not with optional chaining
                session.user.email = token.email as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };