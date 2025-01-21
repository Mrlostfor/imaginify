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
    const user = await getUserById(userId);
    
    if (!user) {
      const clerkUser = await currentUser();
      
      if (!clerkUser) {
        throw new Error("Clerk user not found");
      }

      // Create new user
      const userInfo = {
        clerkId: userId,
        email: clerkUser.emailAddresses[0].emailAddress,
        username: clerkUser.username || `user${Math.random().toString(36).substring(7)}`,
        firstName: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        photo: clerkUser.imageUrl,
        creditBalance: 10
      };

      console.log("Creating new user with info:", userInfo);
      const newUser = await createUser(userInfo);
      console.log("New user created:", newUser);

      if (!newUser) {
        throw new Error("Failed to create new user");
      }

      return (
        <div className="profile-container">
          <h1>Welcome to Imaginify!</h1>
          <p>Your account has been created successfully.</p>
          <div className="user-info">
            <Image 
              src={newUser.photo}
              alt="profile"
              width={100}
              height={100}
              className="rounded-full"
            />
            <div>
              <p>Username: {newUser.username}</p>
              <p>Credits: {newUser.creditBalance}</p>
            </div>
          </div>
        </div>
      );
    }

    // Get user's images
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
    console.error("Profile page error:", error);
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>Something went wrong. Please try again later.</p>
      </div>
    );
  }
};

export default Profile;