export default async function DashboardPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
      </div>
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center p-8">
          <h3 className="text-2xl font-bold tracking-tight">Welcome to MindReMinder</h3>
          <p className="text-sm text-muted-foreground">
            This is your space to build habits, stay mindful, and track your progress.
            <br />
            Select a section from the sidebar to get started.
          </p>
        </div>
      </div>
    </>
  )
}
