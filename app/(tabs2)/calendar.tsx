import BookingCard from "@/components/BookingCard";
import DeleteBookButton from "@/components/DeleteBookButton";
import Loading from "@/components/Loading";
import { useGroup } from "@/contexts/GroupContext";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/clerk-expo";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useMutation, useQuery } from "convex/react";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import Toast, { BaseToast } from "react-native-toast-message";

interface MarkedDates {
  [date: string]: {
    selected: boolean;
    startingDay?: boolean;
    endingDay?: boolean;
    color: string;
  };
}

export default function Bookings() {
  const { groupId } = useGroup();

  const { user } = useUser();

  const clerkId = user?.id as string;

  const fullUser = useQuery(
    api.users.getUserByClerk,
    clerkId ? { clerkId } : "skip"
  );

  const bookings = useQuery(api.bookings.getByGroupId, {
    groupId: groupId as Id<"groups">,
  });

  const userBookings = useQuery(
    api.bookings.getUserBookings,
    fullUser
      ? {
          groupId: groupId as Id<"groups">,
          userId: fullUser._id as Id<"users">,
        }
      : "skip"
  );

  const group = useQuery(api.groups.getById, {
    groupId: groupId as Id<"groups">,
  });

  const today = new Date().toString();

  //date consts states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [localMarkedDates, setLocalMarkedDates] = useState<MarkedDates>({});

  const markedDatesDB = useQuery(api.bookings.getMarkedDates, {
    groupId: groupId as Id<"groups">,
  });

  //local marked dates
  useEffect(() => {
    setLocalMarkedDates({ ...markedDatesDB, ...markedDates });
  }, [markedDatesDB, markedDates]);

  const [modalMaxBookings, setModalMaxBookings] = useState<boolean>(false);

  //modal max bookings
  useEffect(() => {
    if (group && userBookings) {
      if (userBookings.length > group.maxBookings) {
        setModalMaxBookings(true);
      } else {
        setModalMaxBookings(false);
      }
    }
  }, [group, userBookings]);

  const [note, setNote] = useState<string | undefined>(undefined);
  const [modalSave, setModalSave] = useState<boolean>(false);
  const createBooking = useMutation(api.bookings.createBooking);

  //toast config
  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: "#1e293b", borderLeftWidth: 10 }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{ fontSize: 18 }}
        text2Style={{ fontSize: 16 }}
      />
    ),
  };

  // show modal or toast if no date is selected or max bookings reached
  const handleModalSave = () => {
    if (userBookings?.length && group?.maxBookings) {
      if (userBookings.length < group.maxBookings) {
        if (startDate !== "") {
          setModalSave(true);
        } else {
          Toast.show({
            type: "success",
            text1: "Please select a date",
            position: "top",
            visibilityTime: 3500,
          });
        }
      } else {
        Toast.show({
          type: "success",
          text1: "Max Bookings Reached",
          position: "top",
          visibilityTime: 3500,
        });
        setStartDate("");
        setEndDate("");
        setMarkedDates({});
      }
    }
  };

  //calendar functions
  const handleDayPress = (day: DateData) => {
    // Check if the pressed day is already marked in the database
    if (markedDatesDB && markedDatesDB[day.dateString]) {
      // Day is already booked, do nothing
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(day.dateString);
      setEndDate("");
      setMarkedDates({
        [day.dateString]: {
          selected: true,
          startingDay: true,
          endingDay: true,
          color: fullUser?.color as string,
        },
      });
    } else {
      // Check if the new end date is before the start date
      const newEndDate = new Date(day.dateString);
      const currentStartDate = new Date(startDate);

      if (newEndDate < currentStartDate) {
        // Reset selection if end date is before start date
        setStartDate("");
        setEndDate("");
        setMarkedDates({});
        return;
      }

      // Check for overlaps with existing bookings
      let hasOverlap = false;
      let currentDate = new Date(startDate);
      const lastDate = new Date(day.dateString);

      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        if (markedDatesDB && markedDatesDB[dateString]) {
          hasOverlap = true;
          break;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (hasOverlap) {
        // Reset selection if there's an overlap
        setStartDate("");
        setEndDate("");
        setMarkedDates({});
        return;
      }

      // Complete the selection
      setEndDate(day.dateString);

      // Create marked dates object for the range
      const dates: MarkedDates = {};
      currentDate = new Date(startDate);

      while (currentDate <= lastDate) {
        const dateString = currentDate.toISOString().split("T")[0];
        dates[dateString] = {
          selected: true,
          color: fullUser?.color as string,
          startingDay: dateString === startDate,
          endingDay: dateString === day.dateString,
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setMarkedDates(dates);
    }
  };

  //save booking
  const handleSave = async () => {
    if (startDate !== "") {
      let myNote = note;

      if (myNote === "") {
        myNote = undefined;
      }

      const booking = await createBooking({
        startDate: startDate,
        endDate: endDate || startDate, // If no endDate, use startDate
        groupId: groupId as Id<"groups">,
        userId: fullUser!._id,
        note: myNote, // add note
      });

      setMarkedDates({
        [""]: {
          selected: false,
          startingDay: false,
          endingDay: false,
          color: "#fff",
        },
      });

      setModalSave(false);

      setNote("");

      setStartDate("");
      setEndDate("");

      if (!booking.success) {
        // setVisible(true);
      }
    }
  };

  //format date
  const formatDate = (dateStr: string) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const [, mm, dd] = dateStr.split("-");
    const monthIndex = parseInt(mm, 10) - 1;
    return `${monthNames[monthIndex]} ${dd}`;
  };

  const [modalDelete, setModalDelete] = useState<boolean>(false);

  if (bookings === undefined || userBookings === undefined) {
    return <Loading />;
  }

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="p-5">
          {/* Calendar View Box */}
          <View className="border border-slate-600 rounded-lg bg-white">
            <Calendar
              style={{
                backgroundColor: "transparent",
              }}
              renderArrow={(direction) => {
                return (
                  <AntDesign
                    size={35}
                    name={direction === "left" ? "leftcircle" : "rightcircle"}
                    color="#1e293b"
                  />
                );
              }}
              onDayPress={handleDayPress}
              markedDates={localMarkedDates}
              markingType="period"
              minDate={today}
              allowSelectionOutOfRange={false}
              disableArrowLeft={false}
              disableArrowRight={false}
              disableAllTouchEventsForDisabledDays={true}
              theme={{
                todayTextColor: "#000",
                selectedDayBackgroundColor: "#000",
                selectedDayTextColor: "#fff",
              }}
            />

            <View className="flex flex-col gap-5 w-full items-center justify-center px-5 my-5">
              <TouchableOpacity
                onPress={handleModalSave}
                className="w-full rounded-lg bg-slate-800 p-5"
              >
                <Text className="text-white font-bold text-xl text-center">
                  Save
                </Text>
              </TouchableOpacity>
              {userBookings?.length !== 0 ? (
                <TouchableOpacity
                  onPress={() => setModalDelete(true)}
                  className="p-5 bg-red-600 rounded-lg w-full"
                >
                  <Text className="text-center text-white font-bold text-xl ">
                    Delete My Bookings
                  </Text>
                </TouchableOpacity>
              ) : (
                <View />
              )}
            </View>
          </View>

          {/* Bookings View Box classes: border border-slate-600 rounded-lg bg-white*/}
          <View className="mt-5 ">
            {bookings.length > 0 ? (
              <View className="w-full">
                <Text className="text-3xl font-semibold text-center my-5">
                  Bookings
                </Text>

                <View className="flex flex-col items-center justify-center gap-5 my-3">
                  {bookings?.map((booking, index) => (
                    <BookingCard booking={booking} key={index} />
                  ))}
                </View>
              </View>
            ) : (
              <View className="w-full">
                <Text className="text-3xl font-semibold text-center my-5">
                  There is no Bookings
                </Text>
              </View>
            )}
          </View>

          {/* end of p-5 view */}
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalSave}
          onRequestClose={() => {
            setModalSave(false);
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardDismissMode="on-drag"
          >
            <BlurView
              intensity={100}
              tint="dark"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View className="flex-1 flex items-center justify-center">
              <View className="w-[90%] -mt-[10%] bg-white rounded-xl p-5 ">
                <View className="flex flex-row items-center justify-between">
                  <Text className="font-bold text-2xl">Save Booking</Text>
                  <TouchableOpacity onPress={() => setModalSave(false)}>
                    <MaterialIcons name="cancel" size={30} color="gray" />
                  </TouchableOpacity>
                </View>

                <View className="flex flex-row w-full items-center justify-between my-10">
                  <Text className="font-semibold text-2xl ">Date:</Text>
                  <Text className="font-semibold text-2xl ">
                    {formatDate(startDate)}
                    {endDate ? ` - ${formatDate(endDate)}` : ""}
                  </Text>
                </View>

                <View className="flex flex-row w-full items-center justify-between mb-5">
                  <Text className="text-center font-semibold text-lg ">
                    Add a note
                  </Text>

                  <Text className="text-gray-500 text-lg">(optional)</Text>
                </View>

                <TextInput
                  className="p-5 border border-slate-600 rounded-lg w-full "
                  numberOfLines={15}
                  multiline={true}
                  placeholder="Note"
                  placeholderTextColor={"#475569"}
                  onChangeText={(newText) => setNote(newText)}
                  defaultValue={note}
                />
                <TouchableOpacity
                  onPress={handleSave}
                  className="w-full rounded-lg bg-slate-800 p-5 mt-5"
                >
                  <Text className="text-white font-bold text-xl text-center">
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalDelete}
          onRequestClose={() => {
            setModalDelete(false);
          }}
        >
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View className="flex-1 flex items-center justify-center">
            <View className="w-[90%] max-h-[80%] -mt-[10%] bg-white rounded-xl p-5 ">
              <View className="flex flex-row items-center justify-between">
                <Text className="font-bold text-2xl">Delete Bookings</Text>
                <TouchableOpacity onPress={() => setModalDelete(false)}>
                  <MaterialIcons name="cancel" size={30} color="gray" />
                </TouchableOpacity>
              </View>

              {userBookings.length === 0 ? (
                <Text className="text-center text-gray-500 text-lg mt-5">
                  No bookings to delete
                </Text>
              ) : (
                <Text className="text-center text-gray-500 text-lg mt-5">
                  Press and hold to delete
                </Text>
              )}

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false}
              >
                <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
                  {userBookings &&
                    userBookings.map((booking, index) => (
                      <DeleteBookButton key={index} booking={booking} />
                    ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalMaxBookings}
          onRequestClose={() => {
            setModalMaxBookings(false);
          }}
        >
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
          <View className="flex-1 flex items-center justify-center">
            <View className="w-[90%] max-h-[80%] -mt-[10%] bg-white rounded-xl p-5 ">
              <Text className="font-bold text-center text-2xl">
                Max Bookings Reached
              </Text>

              <Text className="text-center text-gray-500 text-lg mt-5">
                You have {userBookings.length} bookings.
              </Text>

              <Text className="text-center text-gray-500 text-lg">
                Group allows {group?.maxBookings} bookings.
              </Text>

              <Text className="text-center text-gray-500 text-lg mt-5">
                Press and hold to delete
              </Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
                bounces={false}
              >
                <View className="flex flex-col w-full items-start justify-center gap-5 my-10">
                  {userBookings &&
                    userBookings.map((booking, index) => (
                      <DeleteBookButton key={index} booking={booking} />
                    ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Toast config={toastConfig} />
    </View>
  );
}
