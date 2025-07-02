"use client"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"
import { MicroActionsPageClient } from "@/components/dashboard/micro-actions-page-client"

interface MicroAction {
  id: string
  title: string
  description: string
  category: string
  is_completed: boolean
  completed_at: string | null
  created_at: string
}

interface MicroActionsPageClientProps {
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    profileImage: string | null
    createdAt: string
    emailConfirmed: boolean
  }
}

export default async function MicroActionsPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, profile_image_url")
    .eq("id", user.id)
    .single()

  const userData = {
    id: user.id,
    email: user.email || "",
    firstName: profile?.first_name || "",
    lastName: profile?.last_name || "",
    profileImage: profile?.profile_image_url || null,
    createdAt: user.created_at,
    emailConfirmed: !!user.email_confirmed_at,
  }

  return <MicroActionsPageClient user={userData} />
}

// function MicroActionsPageClient({ user }: MicroActionsPageClientProps) {
//   const [microActions, setMicroActions] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [microActionModalOpen, setMicroActionModalOpen] = useState(false)
//   const router = useRouter()
//   const supabaseClient = createClient()

//   useEffect(() => {
//     const fetchMicroActions = async () => {
//       try {
//         const { data, error } = await supabaseClient
//           .from("micro_actions")
//           .select("*")
//           .eq("user_id", user.id)
//           .order("created_at", { ascending: false })

//         if (error) {
//           console.error("Error fetching micro actions:", error)
//           return
//         }

//         setMicroActions(data || [])
//       } catch (error) {
//         console.error("Failed to fetch micro actions:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchMicroActions()

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabaseClient.auth.onAuthStateChange((event, session) => {
//       if (event === "SIGNED_OUT" || !session) {
//         router.push("/login")
//       } else if (session?.user) {
//         // Refresh user data
//       }
//     })

//     return () => subscription.unsubscribe()
//   }, [router, supabaseClient.auth, user.id])

//   const toggleMicroActionComplete = async (actionId: string, isCompleted: boolean) => {
//     try {
//       const { error } = await supabaseClient
//         .from("micro_actions")
//         .update({
//           is_completed: !isCompleted,
//           completed_at: !isCompleted ? new Date().toISOString() : null,
//         })
//         .eq("id", actionId)

//       if (error) {
//         console.error("Error updating micro action:", error)
//         return
//       }

//       // Refresh micro actions
//       await fetchMicroActions()
//     } catch (error) {
//       console.error("Failed to update micro action:", error)
//     }
//   }

//   const deleteMicroAction = async (actionId: string) => {
//     try {
//       const { error } = await supabaseClient.from("micro_actions").delete().eq("id", actionId)

//       if (error) {
//         console.error("Error deleting micro action:", error)
//         return
//       }

//       // Refresh micro actions
//       await fetchMicroActions()
//     } catch (error) {
//       console.error("Failed to delete micro action:", error)
//     }
//   }

//   const fetchMicroActions = async () => {
//     try {
//       const { data, error } = await supabaseClient
//         .from("micro_actions")
//         .select("*")
//         .eq("user_id", user.id)
//         .order("created_at", { ascending: false })

//       if (error) {
//         console.error("Error fetching micro actions:", error)
//         return
//       }

//       setMicroActions(data || [])
//     } catch (error) {
//       console.error("Failed to fetch micro actions:", error)
//     }
//   }

//   const getCategoryColor = (category: string) => {
//     const colors: { [key: string]: string } = {
//       health: "bg-green-100 text-green-800",
//       productivity: "bg-blue-100 text-blue-800",
//       mindfulness: "bg-purple-100 text-purple-800",
//       learning: "bg-yellow-100 text-yellow-800",
//       social: "bg-pink-100 text-pink-800",
//       default: "bg-gray-100 text-gray-800",
//     }
//     return colors[category] || colors.default
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//       </div>
//     )
//   }

//   const completedActions = microActions.filter((action) => action.is_completed)
//   const pendingActions = microActions.filter((action) => !action.is_completed)

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
//       <div className="lg:pl-72">
//         <Header user={user} setSidebarOpen={setSidebarOpen} />

//         <main className="py-10">
//           <div className="px-4 sm:px-6 lg:px-8">
//             {/* Header */}
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900">Micro Actions</h1>
//                 <p className="text-gray-600 mt-2">Small steps that lead to big changes</p>
//               </div>
//               <Button onClick={() => setMicroActionModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
//                 <Plus className="h-4 w-4 mr-2" />
//                 New Micro Action
//               </Button>
//             </div>

//             {/* Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center">
//                     <Target className="h-8 w-8 text-blue-600" />
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Total Actions</p>
//                       <p className="text-2xl font-bold text-gray-900">{microActions.length}</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center">
//                     <CheckCircle2 className="h-8 w-8 text-green-600" />
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Completed</p>
//                       <p className="text-2xl font-bold text-gray-900">{completedActions.length}</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-6">
//                   <div className="flex items-center">
//                     <Zap className="h-8 w-8 text-yellow-600" />
//                     <div className="ml-4">
//                       <p className="text-sm font-medium text-gray-600">Pending</p>
//                       <p className="text-2xl font-bold text-gray-900">{pendingActions.length}</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {microActions.length === 0 ? (
//               <Card className="text-center py-12">
//                 <CardContent>
//                   <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">No micro actions yet</h3>
//                   <p className="text-gray-600 mb-6">Start with small actions to build lasting habits</p>
//                   <Button onClick={() => setMicroActionModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Micro Action
//                   </Button>
//                 </CardContent>
//               </Card>
//             ) : (
//               <div className="space-y-6">
//                 {/* Pending Actions */}
//                 {pendingActions.length > 0 && (
//                   <div>
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Actions</h2>
//                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                       {pendingActions.map((action) => (
//                         <Card key={action.id} className="hover:shadow-lg transition-shadow">
//                           <CardHeader className="pb-3">
//                             <div className="flex items-start justify-between">
//                               <div className="flex-1">
//                                 <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
//                                   {action.title}
//                                 </CardTitle>
//                                 {action.description && (
//                                   <CardDescription className="text-sm text-gray-600">
//                                     {action.description}
//                                   </CardDescription>
//                                 )}
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => toggleMicroActionComplete(action.id, action.is_completed)}
//                                   className="p-1"
//                                 >
//                                   <Circle className="h-5 w-5 text-gray-400" />
//                                 </Button>
//                                 <Button variant="ghost" size="sm" className="p-1">
//                                   <Edit className="h-4 w-4 text-gray-400" />
//                                 </Button>
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => deleteMicroAction(action.id)}
//                                   className="p-1 text-red-600 hover:text-red-700"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </div>
//                           </CardHeader>
//                           <CardContent>
//                             <Badge className={getCategoryColor(action.category)}>{action.category}</Badge>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Completed Actions */}
//                 {completedActions.length > 0 && (
//                   <div>
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Actions</h2>
//                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                       {completedActions.map((action) => (
//                         <Card key={action.id} className="opacity-75 hover:opacity-100 transition-opacity">
//                           <CardHeader className="pb-3">
//                             <div className="flex items-start justify-between">
//                               <div className="flex-1">
//                                 <CardTitle className="text-lg font-semibold text-gray-900 mb-1 line-through">
//                                   {action.title}
//                                 </CardTitle>
//                                 {action.description && (
//                                   <CardDescription className="text-sm text-gray-600">
//                                     {action.description}
//                                   </CardDescription>
//                                 )}
//                               </div>
//                               <div className="flex items-center space-x-1">
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => toggleMicroActionComplete(action.id, action.is_completed)}
//                                   className="p-1"
//                                 >
//                                   <CheckCircle2 className="h-5 w-5 text-green-600" />
//                                 </Button>
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   onClick={() => deleteMicroAction(action.id)}
//                                   className="p-1 text-red-600 hover:text-red-700"
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </div>
//                           </CardHeader>
//                           <CardContent>
//                             <div className="flex items-center justify-between">
//                               <Badge className={getCategoryColor(action.category)}>{action.category}</Badge>
//                               {action.completed_at && (
//                                 <span className="text-xs text-gray-500">
//                                   Completed {new Date(action.completed_at).toLocaleDateString()}
//                                 </span>
//                               )}
//                             </div>
//                           </CardContent>
//                         </Card>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Modal */}
//       <CreateMicroActionModal open={microActionModalOpen} onOpenChange={setMicroActionModalOpen} />
//     </div>
//   )
// }
