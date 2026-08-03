import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShieldAlert,
  LogOut,
  Coins,
  Gift as OfferIcon,
  Wallet,
  History as HistoryIcon,
  Sparkles,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Search,
  RefreshCcw,
  ArrowUpRight,
  Trophy,
  Copy,
  Link2,
  ShieldCheck,
  Key,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const { user, loading, logout, isAdmin, refreshProfile, activities } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const BASE_URL = "https://rewardsverse.online";

  // Danh sách postback URL cho tất cả 8 tường ưu đãi
  // subId / userid / user_id = {placeholder} mà provider sẽ tự điền username của user
  const POSTBACK_URLS: { provider: string; label: string; color: string; authMethod: string; url: string }[] = [
    {
      provider: "revtoo",
      label: "Revtoo",
      color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
      authMethod: "token",
      url: `${BASE_URL}/api/postback/revtoo?token=7y9n22mjsz0c3ujyncuomz95k6p31p&subId={subId}&transId={transId}&payout={payout}&offer_name={offer_name}&status={status}`,
    },
    {
      provider: "cointo",
      label: "Cointo",
      color: "text-green-400 border-green-500/30 bg-green-500/10",
      authMethod: "token",
      url: `${BASE_URL}/api/postback/cointo?token=Fp2Lr9Gx2Ay2Ri8&subId={subId}&transId={transId}&reward={reward}&payout={payout}&offer_name={offer_name}&status={status}`,
    },
    {
      provider: "gemiwall",
      label: "Gemiwall",
      color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
      authMethod: "token",
      url: `${BASE_URL}/api/postback/gemiwall?token=6987046ad95123da06330801&subId={subId}&transId={transId}&reward={reward}&payout={payout}&offer_name={offer_name}&status={status}`,
    },
    {
      provider: "taskwall",
      label: "Taskwall",
      color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
      authMethod: "token",
      url: `${BASE_URL}/api/postback/taskwall?token=0640f51b6a17749572b508423c387b00&userid={userid}&payout={payout}&offer_name={offer_name}&offer_id={offer_id}&password={password}&app_name={app_name}&date={date}`,
    },
    {
      provider: "adswedmedia",
      label: "Adswed Media",
      color: "text-pink-400 border-pink-500/30 bg-pink-500/10",
      authMethod: "token",
      url: `${BASE_URL}/api/postback/adswedmedia?token=Au6Ue9Lg5Fh4Jr2&user_id={subId}&reward={payout}&transid={transid}&offer_name={offer_name}&offer_id={offer_id}`,
    },
    {
      provider: "moustache",
      label: "Moustache",
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
      authMethod: "hmac",
      url: `${BASE_URL}/api/postback/moustache?token=B6GScgjbtwvjAJRH4P5Fzhx4iXBk7I7L&subId={subId}&transId={transId}&reward={reward}&payout={payout}&offer_name={offer_name}&status={status}&signature={signature}&company_id={company_id}`,
    },
    {
      provider: "klink",
      label: "Klink Finance",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
      authMethod: "hmac",
      url: `${BASE_URL}/api/postback/klink?token=b4f89770-d4da-42c1-8fee-03303dd14401&subId={subId}&transId={transId}&reward={reward}&payout={payout}&offer_name={offer_name}&status={status}&signature={signature}&company_id={company_id}`,
    },
    {
      provider: "clickwall",
      label: "Clickwall",
      color: "text-red-400 border-red-500/30 bg-red-500/10",
      authMethod: "token",
      url: `${BASE_URL}/api/postback/clickwall?token=10621&subId={subId}&transId={transId}&reward={reward}&payout={payout}&offer_name={offer_name}&status={status}`,
    },
  ];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Đã copy Postback URL!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const statsQuery = trpc.admin.getStats.useQuery();
  const withdrawalsQuery = trpc.admin.getWithdrawals.useQuery();
  const usersQuery = trpc.admin.getUsers.useQuery();

  const approveMutation = trpc.admin.approveWithdrawal.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal approved! Funds sent.");
      withdrawalsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = trpc.admin.rejectWithdrawal.useMutation({
    onSuccess: () => {
      toast.success("Withdrawal rejected & refunded to user.");
      withdrawalsQuery.refetch();
      statsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (!loading && !user) setLocation("/");
    if (!loading && !isAdmin) {
      toast.error("Access denied. Admin only.");
      setLocation("/dashboard");
    }
  }, [user, loading, isAdmin, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  const stats = statsQuery.data;
  const users = usersQuery.data || [];
  const withdrawals = withdrawalsQuery.data || [];
  const balance = parseFloat(user.balance || "0") || 0;

  const filteredUsers = searchQuery 
    ? users.filter((u: any) => (u.username || "").toLowerCase().includes(searchQuery.toLowerCase()) || (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()))
    : users;

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: false },
    { label: "Offer Walls", icon: OfferIcon, path: "/offers", active: false },
    { label: "Withdraw", icon: Wallet, path: "/withdraw", active: false },
    { label: "History", icon: HistoryIcon, path: "/history", active: false },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard", active: false },
    { label: "Admin Panel", icon: Sparkles, path: "/admin", active: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Activity Ticker - Real Data */}
      <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-background/80 backdrop-blur-md border-b border-border/50 overflow-hidden flex items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-16 text-[11px] font-medium text-muted-foreground">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-16">
              {activities.map((a: any) => (
                <span key={`${i}-${a.id}`} className="flex items-center gap-2">
                  <Badge variant="outline" className={`py-0 h-5 ${
                    a.type === "offer_complete" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                    a.type === "withdrawal" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                    a.type === "daily_claim" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                    "bg-purple-500/10 text-purple-400 border-purple-500/20"
                  }`}>
                    {a.type === "offer_complete" ? "EARNED" : a.type === "withdrawal" ? "WITHDRAW" : a.type === "daily_claim" ? "BONUS" : "REFERRAL"}
                  </Badge>
                  <span className="text-white font-semibold">{a.username}</span>
                  <span>{a.description}</span>
                  {a.amount && <span className="text-green-400 font-semibold">${parseFloat(a.amount).toFixed(2)}</span>}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-9 left-0 right-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-green-cyan flex items-center justify-center shadow-lg shadow-green-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">Admin <span className="text-gradient">Panel</span></h1>
              <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-bold">RewardsVerse Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-[9px] py-0 h-5 border-purple-500/30 text-purple-400 bg-purple-500/10 font-bold">ADMIN</Badge>
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-red-400">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="fixed top-[6.5rem] left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-all rounded-t-lg border-b-2 ${
                item.active ? "text-green-400 border-green-400 bg-green-500/5" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="pt-[10.5rem] pb-8 px-4 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Users</p>
                  <p className="text-xl font-black">{stats?.userCount || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Paid</p>
                  <p className="text-xl font-black">${stats?.totalWithdrawn || "0.00"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Pending</p>
                  <p className="text-xl font-black">{stats?.pendingWithdrawals || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Offers Done</p>
                  <p className="text-xl font-black">{stats?.totalOffersCompleted || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Withdrawals */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-cyan-400" />
                    Withdrawal Requests
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => withdrawalsQuery.refetch()} className="h-8">
                    <RefreshCcw className="w-3 h-3 mr-1" /> Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {withdrawals.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No withdrawal requests</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {withdrawals.map((w: any) => (
                      <div key={w.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-border transition-all">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          w.status === "approved" ? "bg-green-500/20" : w.status === "rejected" ? "bg-red-500/20" : "bg-yellow-500/20"
                        }`}>
                          {w.status === "approved" ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                           w.status === "rejected" ? <XCircle className="w-5 h-5 text-red-400" /> :
                           <AlertCircle className="w-5 h-5 text-yellow-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold truncate">{w.username || `User #${w.userId}`}</p>
                            <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${
                              w.status === "approved" ? "text-green-400 border-green-500/30 bg-green-500/10" :
                              w.status === "pending" ? "text-yellow-400 border-yellow-500/30 bg-yellow-500/10" :
                              "text-red-400 border-red-500/30 bg-red-500/10"
                            }`}>
                              {w.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            <span className="font-bold text-white">${parseFloat(w.amount || "0").toFixed(2)}</span> via {w.cryptoType?.toUpperCase()} | {w.walletAddress?.substring(0, 16)}...
                          </p>
                          {w.walletAddress && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                navigator.clipboard.writeText(w.walletAddress);
                                toast.success("Wallet address copied!");
                              }}
                              className="mt-1.5 h-6 px-2 text-[10px] text-cyan-400 hover:bg-cyan-500/10 border border-cyan-500/30"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copy wallet address
                            </Button>
                          )}
                          <p className="text-[9px] text-muted-foreground mt-0.5">
                            {w.createdAt ? new Date(w.createdAt).toLocaleString() : ""}
                          </p>
                        </div>
                        {w.status === "pending" && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate({ id: w.id })}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs h-8 px-3 font-bold"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => rejectMutation.mutate({ id: w.id })}
                              disabled={approveMutation.isPending || rejectMutation.isPending}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs h-8 px-3 font-bold"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Users */}
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    Registered Users
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => usersQuery.refetch()} className="h-8">
                    <RefreshCcw className="w-3 h-3 mr-1" /> Refresh
                  </Button>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 bg-background border-border/50 text-xs" 
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {filteredUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50 hover:border-border transition-all">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        u.role === "admin" ? "bg-purple-500/20 text-purple-400" : "bg-green-500/20 text-green-400"
                      }`}>
                        {(u.username || u.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold truncate">{u.username || u.name}</p>
                          {u.role === "admin" && <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-purple-500/30 text-purple-400">ADMIN</Badge>}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Balance: <span className="text-green-400 font-bold">${parseFloat(u.balance || "0").toFixed(2)}</span> | Offers: {u.offersCompleted || 0} | XP: {u.xp || 0}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-muted-foreground">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Postback URLs */}
          <Card className="border-border/50 bg-card/50 mt-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-green-400" />
                  Postback URLs — Cấu hình trong dashboard từng tường ưu đãi
                </CardTitle>
                <Badge variant="outline" className="text-[9px] px-2 py-0 h-5 border-green-500/30 text-green-400 bg-green-500/10 font-bold">
                  8 PROVIDERS
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                Copy URL rồi dán vào mục "Postback URL" / "Callback URL" trong dashboard của từng nhà cung cấp.
                Các placeholder như <code className="text-green-400">{"{subId}"}</code> sẽ được provider tự điền khi gửi về.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {POSTBACK_URLS.map((pb) => (
                  <div key={pb.provider} className="rounded-lg border border-border/50 bg-background/50 p-3 hover:border-border transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 font-bold ${pb.color}`}>
                          {pb.label.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${
                          pb.authMethod === "hmac"
                            ? "border-purple-500/30 text-purple-400 bg-purple-500/10"
                            : "border-cyan-500/30 text-cyan-400 bg-cyan-500/10"
                        }`}>
                          {pb.authMethod === "hmac" ? (
                            <><ShieldCheck className="w-2.5 h-2.5 mr-1 inline" />HMAC-SHA256</>
                          ) : (
                            <><Key className="w-2.5 h-2.5 mr-1 inline" />TOKEN</>
                          )}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(pb.url, pb.provider)}
                        className={`h-7 px-3 text-[10px] font-bold transition-all ${
                          copiedKey === pb.provider
                            ? "border-green-500/50 text-green-400 bg-green-500/10"
                            : "border-border/50 text-muted-foreground hover:border-green-500/30 hover:text-green-400"
                        }`}
                      >
                        {copiedKey === pb.provider ? (
                          <><CheckCircle2 className="w-3 h-3 mr-1" />Copied!</>
                        ) : (
                          <><Copy className="w-3 h-3 mr-1" />Copy URL</>
                        )}
                      </Button>
                    </div>
                    <code className="block text-[10px] text-muted-foreground bg-background/80 rounded px-3 py-2 border border-border/30 break-all leading-relaxed font-mono select-all">
                      {pb.url}
                    </code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
