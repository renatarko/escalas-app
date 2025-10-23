"use client";

import z from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const invitationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  name: z.string().optional(),
  instruments: z
    .string()
    .min(1, { message: "At least one instrument is required" })
    .transform((val) => val.split(",").map((s) => s.trim())),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface InviteBandMemberDialogProps {
  bandId: string;
}

export const InviteBandMemberDialog = ({
  bandId,
}: InviteBandMemberDialogProps) => {
  const { mutateAsync: createInvitation } = api.invitation.create.useMutation();

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      name: "",
      instruments: "",
    },
  });

  const onSubmit = async (data: InvitationFormData) => {
    try {
      await createInvitation({
        bandId,
        email: data.email,
        name: data.name,
        instruments: data.instruments,
      });
      form.reset();
      // Optionally, show a success toast or close the dialog
    } catch (error) {
      console.error("Error creating invitation:", error);
      // Optionally, show an error toast
    }
  };

  const dialogId = "invite-band-member-dialog";

  return (
    <Dialog>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogTrigger asChild>
            <Button
              data-slot="dialog-trigger"
              aria-controls={dialogId}
              aria-haspopup="dialog"
              aria-expanded={false}
            >
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent id={dialogId} className="space-y-4 p-4">
            <DialogHeader>
              <DialogTitle>Invite a Band Member</DialogTitle>
              <DialogDescription>
                Invite someone to join your band by entering their email and
                instruments.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@domain.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instruments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruments (comma-separated)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Guitar, Vocals" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};
