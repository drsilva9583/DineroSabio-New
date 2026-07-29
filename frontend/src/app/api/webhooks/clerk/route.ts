import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
    const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    if (!CLERK_WEBHOOK_SIGNING_SECRET) {
        return NextResponse.json({ error: "CLERK_WEBHOOK_SIGNING_SECRET is not defined" }, { status: 500 });
    }

    const webhook = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET);

    const payload = await req.text();
    const svix_id = req.headers.get("svix-id");
    const svix_timestamp = req.headers.get("svix-timestamp");
    const svix_signature = req.headers.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json({ error: "Missing required Svix headers" }, { status: 400 });
    }

    let event: WebhookEvent;

    try {
        event = webhook.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature
        }) as WebhookEvent; 
    } catch {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "user.created":
        case "user.updated": {
            const { id, first_name, last_name, email_addresses, primary_email_address_id } = event.data;
            const primaryEmail = email_addresses.find((email) => email.id === primary_email_address_id)?.email_address;
            if (!primaryEmail) {
                return NextResponse.json({ received: true }, { status: 200 });
            }
            
            const name = [first_name, last_name].filter(Boolean).join(" ") || undefined;

            try {
                await db.user.upsert({
                    where: { clerkId: id },
                    update: { email: primaryEmail, name: name },
                    create: { clerkId: id, email: primaryEmail, name: name },
                });
            } catch {
                return NextResponse.json({ error: "Failed to upsert user in database" }, { status: 500 });
            }
            break;
        }
        case "user.deleted": {
            // Handle user deleted event
            const { id } = event.data;
            if (!id) {
                return NextResponse.json({ received: true }, { status: 200 });
            }
            try {
                await db.user.deleteMany({
                    where: { clerkId: id },
                });
            } catch {
                return NextResponse.json({ error: "Failed to delete user from database" }, { status: 500 });
            }
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
}