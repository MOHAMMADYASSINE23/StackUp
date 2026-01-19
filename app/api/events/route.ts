import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

import connectDB from "@/lib/mongodb";
import Event from '@/database/event.model';

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;
        try {
            // Note: Since you're uploading multipart/form-data, this will read all fields as strings.
            // We override the image, tags, and agenda properly below.
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid form data format' }, { status: 400 });
        }

        const file = formData.get('image') as File;
        if (!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 });

        const tags = JSON.parse(formData.get('tags') as string);
        const agenda = JSON.parse(formData.get('agenda') as string);

        // Convert file to Buffer for ImageKit upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to ImageKit
        const uploadResult = await imagekit.upload({
            file: buffer, // Required: can be a Buffer, base64 string, or file URL
            fileName: file.name || 'event-image', // Required
            folder: '/DevEvent', // Optional path
        });

        // ImageKit returns 'url' or 'thumbnailUrl'. 'url' is the direct full-resolution link.
        event.image = uploadResult.url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: 'Event fetching failed', error: e instanceof Error ? e.message : 'Unknown' }, { status: 500 });
    }
}