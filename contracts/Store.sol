// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}
abstract contract Ownable is Context {
    address private _owner;
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }
    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }
    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }
    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
contract NebulaLock is Ownable (){
event Deposited(address indexed Payer, string indexed Receiver, uint256 amount, bool Nebula, string TxnId);
event Withdrawn(address indexed receiver, uint256 amount);
event Payment(address indexed sender, uint256 amount);
bool transactionStatus;
constructor() {
}
    function deposit(string memory Receiver, string memory txnId) public payable {
        assert(msg.value > 0);
        
        emit Deposited(msg.sender, Receiver, msg.value, true, txnId);
    }
    function checkStatus() public view onlyOwner returns(uint256){
        uint256 balance = address(this).balance;
        return balance;
    }
    function withdraw(address payable Receiver, uint256 amount) public onlyOwner{
        assert(msg.sender == owner());
        (bool success, ) = Receiver.call{value:amount}("");
        require(success, "Transfer failed.");
    emit Withdrawn(Receiver, amount);
    }
     receive() external payable {
    // From PaymentSplitter.sol, 99% of the time won't register
    emit Payment(msg.sender, msg.value);
    }
    // Function to receive ether, msg.data is not empty
    fallback() external payable {
    // From PaymentSplitter.sol, 99% of the time won't register
    emit Payment(msg.sender, msg.value);
    }
    function getBalance() external view returns (uint) {
    return address(this).balance;
    }
}