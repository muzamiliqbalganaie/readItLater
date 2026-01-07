import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Mail, Clock, Key } from "lucide-react";
import { useLocation } from "wouter";

export default function Profile() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">View and manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-white text-2xl">{user.name || "User"}</CardTitle>
                <CardDescription className="text-blue-100">
                  Account created on {new Date(user.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{user.email || "Not provided"}</p>
                </div>
              </div>

              {/* Login Method */}
              {user.loginMethod && (
                <div className="flex items-start gap-4">
                  <div className="pt-1">
                    <Key className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Login Method</p>
                    <p className="text-lg text-gray-900 capitalize">{user.loginMethod}</p>
                  </div>
                </div>
              )}

              {/* Last Signed In */}
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <Clock className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Last Signed In</p>
                  <p className="text-lg text-gray-900">
                    {new Date(user.lastSignedIn).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-start gap-4 pt-4 border-t">
                <div className="pt-1">
                  <Key className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-sm text-gray-600 font-mono break-all">{user.openId}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              Change Password (Coming Soon)
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              Two-Factor Authentication (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700"
          size="lg"
        >
          <LogOut className="mr-2 w-4 h-4" />
          Sign Out
        </Button>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="text-blue-600 hover:text-blue-700"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
