import { NextResponse } from 'next/server';

export const json = NextResponse.json.bind(NextResponse);
export const redirect = NextResponse.redirect.bind(NextResponse);
