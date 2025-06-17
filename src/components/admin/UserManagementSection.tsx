
"use client";

import { useEffect, useMemo } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, UserX, AlertTriangle, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { UserData } from '@/lib/types';

export default function UserManagementSection() {
  const { users, isLoading, isMutating, fetchUsers, changeUserStatus } = useUsers();

  useEffect(() => {
    fetchUsers({ status: 'pending' }); // Fetch pending users on component mount
  }, [fetchUsers]);

  const pendingUsers = useMemo(() => {
    return users.filter(user => user.status === 'pending');
  }, [users]);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleStatusChange = (user: UserData, newStatus: 'approved' | 'rejected') => {
    changeUserStatus(user.uid, newStatus, 'pending'); // Pass 'pending' as current filter
  };


  if (isLoading && pendingUsers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                <div className="flex-grow space-y-1">
                  <Skeleton className="h-4 w-3/4 bg-muted" />
                  <Skeleton className="h-3 w-1/2 bg-muted" />
                </div>
              </CardHeader>
              <CardContent className="py-2">
                <Skeleton className="h-3 w-full bg-muted mb-1" />
                <Skeleton className="h-3 w-2/3 bg-muted" />
              </CardContent>
              <CardFooter className="pt-2 flex justify-end space-x-2">
                <Skeleton className="h-9 w-24 bg-muted rounded-md" />
                <Skeleton className="h-9 w-24 bg-muted rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!isLoading && pendingUsers.length === 0) {
    return (
      <div className="text-center py-10 bg-card border border-border rounded-lg shadow">
        <Users size={48} className="mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold text-foreground">Nenhum Usuário Pendente</h3>
        <p className="text-muted-foreground">Não há novos cadastros aguardando aprovação no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <h3 className="text-2xl font-headline text-foreground">Aprovar Novos Cadastros</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingUsers.map(user => (
          <Card key={user.uid} className="bg-card border-border shadow-md flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center space-x-3 pb-3">
              <Avatar className="h-12 w-12">
                {/* Placeholder for user avatar if you add image upload for users */}
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(user.displayName || user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow min-w-0">
                <CardTitle className="text-lg font-semibold text-foreground truncate" title={user.displayName || user.email || 'Usuário Desconhecido'}>
                  {user.displayName || user.email || 'Usuário Desconhecido'}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground truncate" title={user.email || ''}>
                  {user.email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="py-2 text-sm">
              <p className="text-muted-foreground">
                Cadastro realizado: {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR }) : 'Data indisponível'}
              </p>
              <div className="mt-2">
                 <Badge variant={user.status === 'pending' ? 'secondary' : 'default'} className="text-xs">
                    Status: {user.status === 'pending' ? 'Pendente' : user.status}
                 </Badge>
              </div>
            </CardContent>
            <CardFooter className="pt-3 flex justify-end space-x-2 border-t border-border/30 mt-auto">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500/10" disabled={isMutating}>
                    <UserX size={16} className="mr-2" /> Rejeitar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-primary">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-foreground">Confirmar Rejeição</AlertDialogTitle>
                    <AlertDialogDescription className="text-card-foreground">
                      Tem certeza que deseja rejeitar o cadastro de {user.displayName || user.email}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-muted-foreground hover:bg-muted/20">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleStatusChange(user, 'rejected')}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                      disabled={isMutating}
                    >
                      {isMutating ? "Rejeitando..." : "Confirmar Rejeição"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={isMutating}>
                    <UserCheck size={16} className="mr-2" /> Aprovar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-primary">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-headline text-foreground">Confirmar Aprovação</AlertDialogTitle>
                    <AlertDialogDescription className="text-card-foreground">
                      Tem certeza que deseja aprovar o cadastro de {user.displayName || user.email}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-muted-foreground hover:bg-muted/20">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleStatusChange(user, 'approved')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isMutating}
                    >
                      {isMutating ? "Aprovando..." : "Confirmar Aprovação"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
