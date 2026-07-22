import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  return NextResponse.json(
    {
      ok: true,
      result: 'validResults',
      message: 'success',
    },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  return NextResponse.json(
    {
      ok: true,
      result: 'validResults',
      message: 'success',
    },
    { status: 200 },
  );
}

export async function DELETE(req: Request) {
  return NextResponse.json(
    {
      ok: true,
      result: 'validResults',
      message: 'success',
    },
    { status: 200 },
  );
}

export async function PATCH(req: Request) {
  return NextResponse.json(
    {
      ok: true,
      result: 'validResults',
      message: 'success',
    },
    { status: 200 },
  );
}
