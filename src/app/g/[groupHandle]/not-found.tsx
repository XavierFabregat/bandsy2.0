import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function GroupNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
            <Users className="h-12 w-12 text-white" />
          </div>

          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Search className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                Group Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-slate-600 dark:text-slate-400">
                  We couldn&apos;t find the group you&apos;re looking for. This
                  might be because:
                </p>
                <ul className="space-y-1 text-left text-sm text-slate-500 dark:text-slate-500">
                  <li>• The group name was typed incorrectly</li>
                  <li>• The group has been deleted or made private</li>
                  <li>• The group doesn&apos;t exist on Bandsy</li>
                </ul>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/groups">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Browse Groups
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Go Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
