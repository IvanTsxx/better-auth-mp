# Component Templates

Use these templates to create consistent components adhering to Next.js best practices.

## Server Component (Default)

Use for static content, initial data fetch, and ensuring minimal client-side JavaScript.

```typescript
import { Suspense } from 'react';
import { getData } from './_actions/get-data'; // Adjust import path
import { Skeleton } from '@/shared/components/ui/skeleton'; // Example shared UI import

export default async function FeaturePage() {
  // Data fetching in server component
  const data = await getData();

  return (
    <section>
      <h1>{data.title}</h1>
      {/* Streaming for slower parts */}
      <Suspense fallback={<Skeleton />}>
        <AsyncDetails id={data.id} />
      </Suspense>
    </section>
  );
}

// Ensure async data fetching is safe and separates concerns.
async function AsyncDetails({ id }: { id: string }) {
  // ... fetch more details
  return <div>Detail Content</div>;
}
```

## Client Component

Strictly for interactivity (`useState`, `useEffect`, or DOM events). Keep these as leaf nodes to maximize server rendering.

```typescript
'use client';

import { useState } from 'react';

interface InteractiveWidgetProps {
  initialValue: number;
}

export function InteractiveWidget({ initialValue }: InteractiveWidgetProps) {
  const [count, setCount] = useState(initialValue);
  
  return (
    <div className="p-4 border rounded">
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(c => c + 1)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Increment
      </button>
    </div>
  );
}
```

## Server Action

Use for form submissions and mutations. Keep actions co-located if specific to one feature (`_actions/name.ts`).

```typescript
// src/app/(feature)/_actions/example.ts
'use server';

import { z } from 'zod'; // Recommended for validation
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// import { db } from '@/shared/lib/db'; // Example DB import

const Schema = z.object({
  title: z.string().min(1),
  // Add other fields
});

export async function createItem(formData: FormData) {
  // Convert FormData to object
  const customData = Object.fromEntries(formData);
  
  // Validate input
  const validated = Schema.safeParse(customData);
  
  if (!validated.success) {
    return { error: validated.error.flatten() };
  }
  
  // Perform mutation
  // await db.item.create({ data: validated.data });
  
  // Update cache and redirect
  revalidatePath('/feature');
  redirect('/feature');
}
```
