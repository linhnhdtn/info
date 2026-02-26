import { WelcomeCard } from "@/components/dashboard/WelcomeCard"
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents"
import { RecentNotes } from "@/components/dashboard/RecentNotes"

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <WelcomeCard />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UpcomingEvents />
        <RecentNotes />
      </div>
    </div>
  )
}
