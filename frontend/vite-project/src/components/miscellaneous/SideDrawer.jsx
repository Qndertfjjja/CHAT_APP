import React, { useState } from "react";
import {
  Box,
  Button,
  Text,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Image,
  Flex,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { useToast } from "@chakra-ui/toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";
import { getSender } from "../../config/ChatLogics";
import UserListItem from "../userAvatar/UserListItem";
import { ChatState } from "../../Context/ChatProvider";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { setSelectedChat, user, notification, setNotification, chats, setChats } = ChatState();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  // Keep existing handlers...
  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`https://deployapi-ub0q.onrender.com/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`https://deployapi-ub0q.onrender.com/api/chat`, { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      {/* Outer gradient box */}
      <Box
        bgGradient="linear(to-r, hsl(217, 52%, 78%), hsl(224, 58%, 79%))"
        p={3}
        borderRadius="lg"
        
        height="80px"
      >
        {/* Inner white box */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bg="white"
          w="100%"
          h="100%"
          p="5px 20px"
          borderRadius="lg"
          boxShadow="sm"
        >
          <Tooltip 
            label="Search Users to chat" 
            hasArrow 
            placement="bottom-end"
            bg="hsl(224, 58%, 79%)"
          >
            <Button 
              variant="ghost" 
              onClick={onOpen}
              _hover={{
                bg: "gray.100",
                transform: "translateY(-1px)",
              }}
              color="hsl(224, 58%, 25%)"
            >
              <i className="fas fa-search"></i>
              <Text d={{ base: "none", md: "flex" }} px={4}>
                Search User
              </Text>
            </Button>
          </Tooltip>

          
           
            <Text 
              fontSize="2xl" 
              fontFamily="'Poppins','sans-serif'" 
              fontWeight="extrabold"
              color="hsl(224, 58%, 25%)"
            >
              LETS CHAT
            </Text>
         

          <Flex align="center" gap={3}>
            <Menu>
              <MenuButton p={1}>
                <NotificationBadge
                  count={notification.length}
                  effect={Effect.SCALE}
                />
                <BellIcon 
                  fontSize="2xl" 
                  m={1} 
                  color="hsl(224, 58%, 25%)"
                  _hover={{ transform: "scale(1.1)" }}
                  transition="all 0.2s"
                />
              </MenuButton>
              <MenuList pl={2} boxShadow="lg">
                {!notification.length && "No New Messages"}
                {notification.map((notif) => (
                  <MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                    _hover={{ bg: "gray.100" }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${getSender(user, notif.chat.users)}`}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton 
                as={Button} 
                bg="transparent" 
                rightIcon={<ChevronDownIcon color="hsl(224, 58%, 25%)" />}
                _hover={{ bg: "gray.100" }}
                _active={{ bg: "gray.200" }}
              >
                <Avatar
                  size="sm"
                  cursor="pointer"
                  name={user.name}
                  src={user.pic}
                  border="2px solid hsl(224, 58%, 79%)"
                />
              </MenuButton>
              <MenuList boxShadow="lg">
                <ProfileModal user={user}>
                  <MenuItem _hover={{ bg: "gray.100" }}>My Profile</MenuItem>
                </ProfileModal>
                <MenuDivider />
                <MenuItem 
                  onClick={logoutHandler}
                  _hover={{ bg: "gray.100" }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Box>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader 
            borderBottomWidth="1px"
            bgGradient="linear(to-r, hsl(217, 52%, 78%), hsl(224, 58%, 79%))"
            color="white"
          >
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                focusBorderColor="hsl(224, 58%, 79%)"
              />
              <Button 
                onClick={handleSearch}
                bgGradient="linear(to-r, hsl(217, 52%, 78%), hsl(224, 58%, 79%))"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, hsl(217, 52%, 70%), hsl(224, 58%, 70%))",
                }}
              >
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              Array.isArray(searchResult) && searchResult.length > 0 ? (
                searchResult.map((user) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => accessChat(user._id)}
                  />
                ))
              ) : (
                <Text color="hsl(224, 58%, 25%)">No users found</Text>
              )
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;