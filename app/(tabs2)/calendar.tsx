import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Calendar, DateData } from "react-native-calendars";
import { useGroup } from "@/contexts/GroupContext";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import Loading from "@/components/Loading";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useUser } from "@clerk/clerk-expo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";

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

  const today = new Date().toString();

  //date consts states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [localMarkedDates, setLocalMarkedDates] = useState<MarkedDates>({});

  const markedDatesDB = useQuery(api.bookings.getMarkedDates, {
    groupId: groupId as Id<"groups">,
  });

  useEffect(() => {
    setLocalMarkedDates({ ...markedDatesDB, ...markedDates });
  }, [markedDatesDB, markedDates]);

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

  const [note, setNote] = useState<string | undefined>(undefined);
  const [modalSave, setModalSave] = useState<boolean>(false);

  const handleModalSave = () => {
    if (startDate !== "") {
      setModalSave(true);
    }
  };

  const createBooking = useMutation(api.bookings.createBooking);

  const handleSave = async () => {
    if (startDate) {
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

      if (!booking.success) {
        // setVisible(true);
      }
    }
  };

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

  const handleBookingDelete = () => {};

  if (bookings === undefined || userBookings === undefined) {
    return <Loading />;
  }

  return (
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
            enableSwipeMonths={true}
            onDayPress={handleDayPress}
            markedDates={localMarkedDates}
            markingType="period"
            minDate={today}
            allowSelectionOutOfRange={false}
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
                onPress={() => handleBookingDelete()}
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

        {/* Bookings View Box */}
        <View className="mt-5 border border-slate-600 rounded-lg bg-white">
          <Text className="text-3xl font-semibold text-center my-5">
            Bookings
          </Text>

          <View className="flex flex-col items-center justify-center gap-5 my-3">
            {bookings?.length !== 0 ? (
              bookings?.map((data, index) => (
                <View key={index}>
                  <View
                    className={` w-full flex flex-row items-center justify-between p-5 `}
                  >
                    <Text className="font-semibold text-xl bg-white w-[35%] rounded-r-3xl">
                      {data.username}
                    </Text>

                    <View className="felx flex-row items-center justify-center gap-5">
                      {data.startDate === data.endDate ? (
                        <View />
                      ) : (
                        <Text className="font-medium text-lg">
                          {data.startDate}
                        </Text>
                      )}

                      <FontAwesome
                        size={30}
                        name="arrow-circle-right"
                        color={data.color}
                        className="shadow"
                      />
                      <Text className="font-medium text-lg">
                        {data.endDate}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="w-full my-10">
                <Text className="text-center text-2xl font-semibold">
                  There is no bookings
                </Text>
              </View>
            )}
          </View>
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
    </ScrollView>
  );
}
