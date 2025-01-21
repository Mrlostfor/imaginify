import { auth, currentUser } from "@clerk/nextjs";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Collection } from "@/components/shared/Collection";
import Header from "@/components/shared/Header";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById, createUser } from "@/lib/actions/user.actions";

const Profile = async ({ searchParams }: SearchParamProps) => {
  const page = Number(searchParams?.page) || 1;
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  try {
    let user = await getUserById(userId);
    
    // If user doesn't exist, create a new one
    if (!user) {
      const clerkUser = await currentUser();
      if (!clerkUser) throw new Error("Clerk user not found");

      const userInfo = {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        username: clerkUser.username || "",
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        photo: clerkUser.imageUrl || "",
      };
      
      user = await createUser(userInfo);
      
      if (!user) throw new Error("Failed to create user");
    }

    const images = await getUserImages({ page, userId: user._id });

    return (
      <>
        <Header title="Profile" />

        <section className="profile">
          <div className="profile-balance">
            <p className="p-14-medium md:p-16-medium">CREDITS AVAILABLE</p>
            <div className="mt-4 flex items-center gap-4">
              <Image
                src="/assets/icons/coins.svg"
                alt="coins"
                width={50}
                height={50}
                className="size-9 md:size-12"
              />
              <h2 className="h2-bold text-dark-600">{user.creditBalance}</h2>
            </div>
          </div>

          <div className="profile-image-manipulation">
            <p className="p-14-medium md:p-16-medium">IMAGE MANIPULATION DONE</p>
            <div className="mt-4 flex items-center gap-4">
              <Image
                src="/assets/icons/photo.svg"
                alt="coins"
                width={50}
                height={50}
                className="size-9 md:size-12"
              />
              <h2 className="h2-bold text-dark-600">{images?.data.length}</h2>
            </div>
          </div>
        </section>

        <section className="mt-8 md:mt-14">
          <Collection
            images={images?.data}
            totalPages={images?.totalPages}
            page={page}
          />
        </section>
      </>
    );
  } catch (error) {
    console.error("Error in profile page:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500">Something went wrong</h1>
        <p className="text-gray-600">Please try again later</p>
      </div>
    );
  }
};

export default Profile;