"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Exam profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500">Display name</label>
            <Input placeholder="Student" />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Exam date</label>
            <Input type="date" />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Target score</label>
            <Input placeholder="510" />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Study hours / week</label>
            <Input placeholder="20" />
          </div>
          <Button>Save (demo)</Button>
          <p className="text-xs text-zinc-500">
            Connect Supabase Auth for persistent profiles. Demo mode uses in-memory
            storage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
