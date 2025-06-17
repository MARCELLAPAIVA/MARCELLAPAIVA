
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserData, UserStatus } from '@/lib/types';
import { getUsers as getUsersFromFirestore, updateUserStatus as updateUserStatusInFirestore } from '@/lib/userService';
import { useToast } from "@/hooks/use-toast";

export function useUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const { toast } = useToast();

  const fetchUsers = useCallback(async (filter?: { status?: UserStatus }) => {
    setIsLoading(true);
    try {
      const firestoreUsers = await getUsersFromFirestore(filter);
      setUsers(firestoreUsers);
    } catch (error) {
      console.error("useUsers: Failed to load users from Firestore:", error);
      toast({
        title: "Erro ao Carregar Usuários",
        description: "Não foi possível buscar os usuários. Tente novamente.",
        variant: "destructive",
      });
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial fetch for all users or a specific filter if needed at hook initialization
  // useEffect(() => {
  //   fetchUsers({ status: 'pending' }); // Example: Fetch pending users by default
  // }, [fetchUsers]);

  const changeUserStatus = useCallback(async (uid: string, newStatus: UserStatus, currentStatusFilter?: UserStatus) => {
    setIsMutating(true);
    const userToUpdate = users.find(u => u.uid === uid);
    const userName = userToUpdate?.displayName || userToUpdate?.email || uid;

    try {
      const success = await updateUserStatusInFirestore(uid, newStatus);
      if (success) {
        // After successfully changing the status, refetch the list of users
        // using the same filter that was active (e.g., 'pending').
        if (currentStatusFilter) {
            await fetchUsers({status: currentStatusFilter});
        } else {
            // If no specific filter is known (e.g., if this function were called from another context),
            // refetch all users or a default list.
            await fetchUsers(); 
        }
        
        toast({
          title: "Status Atualizado!",
          description: `Status de ${userName} alterado para ${newStatus}.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to update status in Firestore.");
      }
    } catch (error) {
      console.error(`useUsers: Failed to update status for user ${uid}:`, error);
      toast({
        title: "Erro ao Atualizar Status",
        description: `Não foi possível alterar o status de ${userName}.`,
        variant: "destructive",
      });
    } finally {
      setIsMutating(false);
    }
  }, [toast, fetchUsers, users]); // Added users to dependency array of changeUserStatus as it's used to find userToUpdate

  return {
    users,
    isLoading,
    isMutating,
    fetchUsers, // Expose fetchUsers to allow components to trigger fetches with specific filters
    changeUserStatus,
  };
}
