
"use client";

import { useEffect, useMemo, useState } from 'react'; // Adicionado useState
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserCheck, UserX, Users, ShieldAlert, Filter } from 'lucide-react'; // ShieldAlert, Filter
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Import Select
import type { UserData, UserStatus } from '@/lib/types';

const ALL_STATUSES_VALUE = "all";

export default function UserManagementSection() {
  const { users, isLoading, isMutating, fetchUsers, changeUserStatus } = useUsers();
  const [statusFilter, setStatusFilter] = useState<UserStatus | typeof ALL_STATUSES_VALUE>(ALL_STATUSES_VALUE);

  useEffect(() => {
    if (statusFilter === ALL_STATUSES_VALUE) {
      fetchUsers(); // Fetch all users
    } else {
      fetchUsers({ status: statusFilter });
    }
  }, [fetchUsers, statusFilter]);

  const filteredUsers = useMemo(() => {
    if (statusFilter === ALL_STATUSES_VALUE) {
      return users;
    }
    return users.filter(user => user.status === statusFilter);
  }, [users, statusFilter]);

  const getInitials = (name: string | null | undefined): string => {
    if (!name) return "?";
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleStatusChange = (user: UserData, newStatus: 'approved' | 'rejected' | 'pending') => {
    // Pass the current status filter so the list can be refetched correctly
    changeUserStatus(user.uid, newStatus, statusFilter === ALL_STATUSES_VALUE ? undefined : statusFilter);
  };

  const statusToBadgeVariant = (status: UserStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case 'approved':
        return 'default'; // Primary (gold) for approved
      case 'pending':
        return 'secondary'; // Secondary (darker gold/bronze) for pending
      case 'rejected':
        return 'destructive'; // Destructive (red) for rejected
      default:
        return 'secondary';
    }
  };
   const statusToText = (status: UserStatus): string => {
    switch (status) {
      case 'approved':
        return 'Aprovado';
      case 'pending':
        return 'Pendente';
      case 'rejected':
        return 'Rejeitado';
      default:
        return status;
    }
  };


  if (isLoading && filteredUsers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-10 w-1/2 bg-muted" />
          <Skeleton className="h-10 w-48 bg-muted rounded-md" />
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


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <h3 className="text-2xl font-headline text-foreground text-center sm:text-left">Gerenciamento de Usuários</h3>
        <Select onValueChange={(value) => setStatusFilter(value as UserStatus | typeof ALL_STATUSES_VALUE)} value={statusFilter}>
          <SelectTrigger className="w-full sm:w-[220px] bg-input border-border focus:ring-primary">
            <Filter size={16} className="mr-2 opacity-70" />
            <SelectValue placeholder="Filtrar por status..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STATUSES_VALUE}>Todos os Status</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="rejected">Rejeitados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && filteredUsers.length === 0 && (
        <div className="text-center py-10 bg-card border border-border rounded-lg shadow">
          <Users size={48} className="mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold text-foreground">Nenhum Usuário Encontrado</h3>
          <p className="text-muted-foreground">
            {statusFilter === ALL_STATUSES_VALUE
              ? "Não há usuários cadastrados no momento."
              : `Não há usuários com status "${statusToText(statusFilter as UserStatus)}".`}
          </p>
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map(user => (
            <Card key={user.uid} className="bg-card border-border shadow-md flex flex-col justify-between">
              <CardHeader className="flex flex-row items-center space-x-3 pb-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getInitials(user.displayName || user.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-grow min-w-0">
                  <CardTitle className="text-lg font-semibold text-foreground truncate" title={user.displayName || user.email || 'Usuário Desconhecido'}>
                    {user.displayName || user.email || 'Usuário Desconhecido'}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground truncate" title={user.email || ''}>
                    {user.email} (Role: {user.role})
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="py-2 text-sm">
                <p className="text-muted-foreground">
                  Cadastrado: {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true, locale: ptBR }) : 'Data indisponível'}
                </p>
                {user.updatedAt && (
                   <p className="text-muted-foreground text-xs">
                    Atualizado: {formatDistanceToNow(new Date(user.updatedAt), { addSuffix: true, locale: ptBR })}
                  </p>
                )}
                <div className="mt-2">
                   <Badge variant={statusToBadgeVariant(user.status)} className="text-xs">
                      Status: {statusToText(user.status)}
                   </Badge>
                </div>
              </CardContent>
              <CardFooter className="pt-3 flex flex-wrap justify-end gap-2 border-t border-border/30 mt-auto">
                {user.status !== 'approved' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1 min-w-[100px]" disabled={isMutating}>
                        <UserCheck size={16} className="mr-1 sm:mr-2" /> Aprovar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-primary">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-foreground">Confirmar Aprovação</AlertDialogTitle>
                        <AlertDialogDescription className="text-card-foreground">
                          Aprovar o cadastro de {user.displayName || user.email}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-muted-foreground hover:bg-muted/20">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleStatusChange(user, 'approved')}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          disabled={isMutating}
                        >
                          {isMutating ? "Processando..." : "Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {user.status !== 'rejected' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-500 text-red-500 hover:bg-red-500/10 flex-1 min-w-[100px]" disabled={isMutating}>
                        <UserX size={16} className="mr-1 sm:mr-2" /> Rejeitar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-primary">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-foreground">Confirmar Rejeição</AlertDialogTitle>
                        <AlertDialogDescription className="text-card-foreground">
                          Rejeitar o cadastro de {user.displayName || user.email}?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-muted-foreground hover:bg-muted/20">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleStatusChange(user, 'rejected')}
                          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          disabled={isMutating}
                        >
                          {isMutating ? "Processando..." : "Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                 {user.status !== 'pending' && user.role === 'client' && ( // Allow making a client pending again
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-amber-500 text-amber-500 hover:bg-amber-500/10 flex-1 min-w-[100px]" disabled={isMutating}>
                        <ShieldAlert size={16} className="mr-1 sm:mr-2" /> Mover para Pendente
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-primary">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-headline text-foreground">Mover para Pendente</AlertDialogTitle>
                        <AlertDialogDescription className="text-card-foreground">
                          Mover o usuário {user.displayName || user.email} para o status "Pendente"? Isso pode ser usado para reavaliar uma conta.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-muted-foreground hover:bg-muted/20">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleStatusChange(user, 'pending')}
                          className="bg-amber-500 hover:bg-amber-600 text-white"
                          disabled={isMutating}
                        >
                          {isMutating ? "Processando..." : "Confirmar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
