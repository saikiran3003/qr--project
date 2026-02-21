import { NextResponse } from 'next/server';

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

        // Clear the admin_session cookie
        response.cookies.delete('admin_session');

        return response;
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
